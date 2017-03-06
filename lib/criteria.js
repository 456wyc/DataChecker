var CriteriaTester=require('./tester')

function Criteria(testFunc) {
    this.test = testFunc;
}

Criteria.prototype.mkTester = function (criteriaRule) {
    var _this = this;
    return new CriteriaTester(_this, criteriaRule);
};