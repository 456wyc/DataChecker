var util      = require('util');
var tools     = {
    isOffsetNumber  : function (v) {
        var exp = /^\d+\.?\d*(\+-|\+|-)\d+\.?\d*$/;
        return exp.test(v);
    },
    isBothwayOffset : function (v) {
        var exp = /^\d+\.?\d*\+-\d+\.?\d*$/;
        return exp.test(v);
    },
    isPositiveOffset: function (v) {
        var exp = /^\d+\.?\d*\+\d+\.?\d*$/;
        return exp.test(v);
    },
    isNegativeOffset: function (v) {
        var exp = /^\d+\.?\d*-\d+\.?\d*$/;
        return exp.test(v);
    }
};
exports.tools = tools;

function OperateRS(rs, tips) {
    this.rs   = rs;
    this.tips = tips;
}

function Operator(name, ruleChecker, alu) {
    this.name = name; // 符号
    if (typeof ruleChecker == 'function') {
        this.ruleChecker = null;
        this.alu         = ruleChecker;
    } else {
        this.ruleChecker = ruleChecker; // 标准, 定义运算符支持的规则，预留
        this.alu         = alu; // 运算器
    }
}

Operator._operators = {};

Operator.get = function (name) {
    return Operator._operators[name];
};

Operator.define = function (name, standard, alu) {
    Operator[name] = Operator._operators[name] = new Operator(name, standard, alu);
};

Operator.prototype.operate = function (rule, value, dataName) {
    return this.alu(rule, value, dataName);
};

/**
 * 检测规则标准值是否是标准规则对象
 * {
 *    $eq:{
 *        ...
 *    }
 * }
 * 一个对象，只有一个<操作符：规则>对
 * @param rule
 * @returns {boolean}
 */
Operator.isOperatorObject = function (rule) {
    //{$eq:1000},{$or:[{},{}...]},非运算符对象视作$eq运算符的标准值，如：width：1080 => width:{$eq:1080}
    if (rule && typeof rule == 'object' && !(rule instanceof Array)) {
        var keys = Object.keys(rule);
        if (keys.length > 0 && Operator[keys[0]]) {
            return true;
        }
    }
    return false;
};

/**
 * 将不标准规则转换成标准规则
 * @param rule
 *
 * //基本对象默认作为$eq的规则
 * width:10 =>width:{$eq:10}
 * width:'abc' =>width:{$eq:'abc'}
 * width:'10+-1' =>width:{$eq:'10+-1'}
 * width:'10+1' =>width:{$eq:'10+1'}
 * width:'10-1' =>width:{$eq:'10-1'}
 * 无运算符的对象也作为$eq的规则
 * width:{value:10} =>width:{$eq:{value:10}}
 * width:{value:10, offset:1} =>width:{$eq:{value:10,offset:1}}
 */
Operator.wrap = function (rule) {
    if (typeof rule == 'number' || typeof rule == 'string') {
        return {$eq: rule};
    }
    if (rule instanceof Array) {
        return {$and: rule};
    }
    if (typeof rule == 'object' && !Operator.isOperatorObject(rule)) {
        return {$eq: rule}
    }
    if (rule) {
        return rule;
    } else {
        return {$required: false};
    }
};

Operator.define('$needless', function (rule, dataValue, dataName) {
    //{$needless:{$eq:100}}
    //只要是needless包围的，数据就可以为空
    var dataType = typeof dataValue;
    var nestRule = Operator.wrap(rule);
    var exp      = new Expression(nestRule, dataName);

    if (dataType == 'string') {
        if (dataValue) {
            return exp.compute(dataValue, dataName);//直接返回内存操作的结果
        } else {
            return new OperateRS(true);
        }
    } else if (dataType == 'number') {
        if (isNaN(dataValue)) {
            return new OperateRS(true);
        } else {
            return exp.compute(dataValue, dataName);
        }
    } else {//非规范值，视为null，非必要，所以不检测
        return new OperateRS(true);
    }
});

Operator.define('$and', function (rule, dataValue, dataName) {
    //size:{$and:[{$rt:{}},{$lt:{}}...]}

    if (Operator.isOperatorObject(rule)) {
        //{$eq:{..}}=>[{$eq:{}}]
        rule = [rule];
    }
    /*
    if (!rule instanceof Array) {
        return new OperateRS(false, 'tips');
    }*/
    var rs = new OperateRS(true);
    for (var i = 0, l = rule.length; i < l; i++) {
        var ruleObj = rule[i];
        var exp     = new Expression(ruleObj, dataName);
        rs          = exp.compute(dataValue, dataName);
        if (!rs.rs) {
            return rs;
        }
    }
    return rs;
});
Operator.define('$or', function (rule, dataValue, dataName) {
    //size:{$or:[{$rt:{}},{$lt:{}}...]}
    if (Operator.isOperatorObject(rule)) {
        //{$eq:{..}}=>[{$eq:{}}]
        rule = [rule];
    }
    if (!rule instanceof Array) {
        return new OperateRS(false, 'tips');
    }
    var rs = new OperateRS(false, 'tips');
    for (var i = 0, l = rule.length; i < l; i++) {
        var ruleObj = rule[i];
        var exp     = new Expression(ruleObj, dataName);
        rs          = exp.compute(dataValue, dataName);
        if (rs) {
            return rs;
        }
    }
    return rs;
});

Operator.define('$eq', function (rule, dataValue, dataName) {
    //width:{$eq:10}
    //width:{$eq:'abc'}
    //width:{$eq:'10+-1'} //正负误差
    //width:{$eq:'10+1'}//正误差
    //width:{$eq:'10-1'}//负误差
    //width:{$eq:{value:10}}
    //width:{$eq:{value:10,offset:1}}
    if (rule == null) {//没有规范，直接通过
        return new OperateRS(true);
    }
    if (typeof rule == 'number') {
        return rule == dataValue ? new OperateRS(true) : new OperateRS(false, util.format('%s的值%s不等于%s', dataName,
            dataValue, rule));
    }
    if (rule && (typeof rule == 'string') && tools.isOffsetNumber(rule)) {
        var baseValue   = 0;
        var offsetValue = 0;
        if (tools.isPositiveOffset(rule)) {
            baseValue   = rule.split('+')[0];
            offsetValue = rule.split('+')[1];
            return (dataValue >= baseValue) && (dataValue <= baseValue + offsetValue) ?
              new OperateRS(true) : new OperateRS(false,
                util.format('%s的值%s不等于%s(误差+%s)', dataName, dataValue, baseValue, offsetValue));
        } else if (tools.isNegativeOffset(rule)) {
            baseValue   = rule.split('-')[0];
            offsetValue = rule.split('-')[1];
            return (dataValue >= baseValue - offsetValue) && (dataValue <= baseValue) ?
              new OperateRS(true) : new OperateRS(false, util.format('%s的值%s不等于%s(误差-%s)', dataName, dataValue,
                baseValue, offsetValue));
        } else {
            baseValue   = rule.split('+-')[0];
            offsetValue = rule.split('+-')[1];
            return (dataValue >= baseValue - offsetValue) && (dataValue <= baseValue + offsetValue) ?
              new OperateRS(true) : new OperateRS(false, util.format('%s的值%s不等于%s(误差+/-%s)', dataName, dataValue,
                baseValue, offsetValue));
        }
    }
    if (rule && (typeof rule == 'string') && !tools.isOffsetNumber(rule)) {
        return rule == dataValue ?
          new OperateRS(true) : new OperateRS(false, util.format('%s的值%s不等于%s', dataName, dataValue, rule));
    }
    if (Operator.isOperatorObject(rule)) {
        //非数组对象{value:100},{value:100,offset:10}
        baseValue   = Number(rule.value) || 0;
        offsetValue = Number(rule.offset) || 0;
        return (dataValue >= baseValue - offsetValue) && (dataValue <= baseValue + offsetValue) ?
          new OperateRS(true) : new OperateRS(false, util.format('%s的值%s不等于%s(误差%s)', dataName, dataValue, rule,
            offsetValue));
    }
    return new OperateRS(true);
});
Operator.define('$lt', function (rule, dataValue, dataName) {
    //=>width:{$lt:100}
    return dataValue < rule ? new OperateRS(true) : new OperateRS(false, util.format('%s的值%s不小于%s', dataName, dataValue,
        rule));
});
Operator.define('$lte', function (rule, dataValue, dataName) {
    //=>width:{$lte:100}
    return dataValue <= rule ? new OperateRS(true) : new OperateRS(false, util.format('%s的值%s不小于等于%s', dataName,
        dataValue, rule));
});
Operator.define('$rt', function (rule, dataValue, dataName) {
    //=>width:{$rt:100}
    return dataValue > rule ? new OperateRS(true) : new OperateRS(false, util.format('%s的值%s不大于%s', dataName, dataValue,
        rule));
});
Operator.define('$rte', function (rule, dataValue, dataName) {
    //=>width:{$rte:100}
    return dataValue >= rule ? new OperateRS(true) : new OperateRS(false, util.format('%s的值%s不大于等于%s', dataName,
        dataValue, rule));
});
Operator.define('$scale', function (rule, dataValue, dataName) {
    //=>scale:{$scale:'16:9'}
    var exp = /\d+:\d+/;
    if (!exp.test(rule)) {
        return new OperateRS(false, 'tips');
    }
    var baseWH     = rule.split(':');
    var baseWidth  = baseWH[0];
    var baseHeight = baseWH[1];
    var testWH     = dataValue.split(':');
    var testWidth  = testWH[0];
    var testHeight = testWH[1];
    return baseWidth * testHeight == baseHeight * testWidth ?
      new OperateRS(true) : new OperateRS(false, util.format('%s的值%s不等于%s', dataName, dataValue, rule));
});
Operator.define('$in', function (rule, dataValue, dataName) {
    //=>ext:{$in:[]}
    var ruleType = typeof rule;
    if (ruleType == 'string' || ruleType == 'number') {
        rule = [rule];
    }
    if (!(rule instanceof Array)) {
        rule = [rule.toString()];
    }
    return rule.indexOf(dataValue) >= 0 ?
      new OperateRS(true) : new OperateRS(false, util.format('%s的值%s不在[%s]中', dataName, dataValue, rule.join(',')));
});

/**
 * 解构规则对象，返回一个数组[操作符名称，操作符规则]
 * @param obj
 * @returns {[*,*]}
 */
Operator.destructRuleObj = function (obj) {
    var op = Object.keys(obj)[0];
    return [op, obj[op]];
};


/**
 *
 * @constructor
 * @param ruleObj  规则对象：100,'abc',[],{}...
 * @param dataName
 */
function Expression(ruleObj) {
    this.ruleObj       = Operator.wrap(ruleObj); //包装成标准对象
    var destructedRule = Operator.destructRuleObj(this.ruleObj);
    this.opName        = destructedRule[0];
    this.rule          = destructedRule[1];
    this.operator      = Operator.get(this.opName);
    if (this.operator.ruleChecker) {
        this.operator.ruleChecker(this.rule);//检查规则是否合法
    }
}

/**
 * 计算值是否符合要求
 * @param value
 * @param name
 */
Expression.prototype.compute = function (value, name) {
    return this.operator.operate(this.rule, value, name);
};


/**
 * 广告数据验证
 * @param data
 * {
 *    video:{
 *      width:1080,
 *      height:720,
 *      scale:'16:9',
 *      size:8,
 *      time:14950,
 *      ext:'mp4',
 *    },
 *    text:{
 *
 *    }
 * }
 * @param rules
 * {
 *    video:{
 *        width:1080,
 *        height:720,
 *        scale:{$scale:'16:9'},
 *        size:{$lte:10},
 *        time:'15000+-100',
 *        ext:{$in:['flv','mp4']}
 *    },
 *    text:{
 *       length:100
 *    }
 * }
 * @constructor
 * @return {OperateRS}
 */
function ADDataCheck(data, rules) {
    for (var d in data) {
        if (data.hasOwnProperty(d)) {
            console.log('check data.%s', d);
            var rule = rules[d];
            for (var attr in rule) {
                if (rule.hasOwnProperty(attr)) {
                    var testValue = data[d][attr];
                    console.log('check data.%s.%s', d, attr, rule[attr], testValue);
                    var exp = new Expression(rule[attr]);
                    var rs  = exp.compute(testValue, d + '.' + attr);
                    if (!rs.rs) {
                        return rs;
                    }
                }
            }
        }
    }
    return new OperateRS(true);
}

exports.Operator    = Operator;
exports.Expression  = Expression;
exports.ADDataCheck = ADDataCheck;
