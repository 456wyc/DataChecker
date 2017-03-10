var assert      = require('assert');
var dataChecker = require('../lib/dataChecker');

describe('criteria', function () {
    describe.skip('tools', function () {
        describe('isOffsetNumber', function () {
            it('"10+1" return true', function () {
                assert.equal(true, dataChecker.tools.isOffsetNumber('10+1'));
            });
            it('"10-1" return true', function () {
                assert.equal(true, dataChecker.tools.isOffsetNumber('10-1'));
            });
            it('"10+-1" return true', function () {
                assert.equal(true, dataChecker.tools.isOffsetNumber('10+-1'));
            });
            it('"10" return false', function () {
                assert.equal(false, dataChecker.tools.isOffsetNumber('10'));
            });
            it('"10a" return false', function () {
                assert.equal(false, dataChecker.tools.isOffsetNumber('10a'));
            });
            it('"10.5+0.5" return true', function () {
                assert.equal(true, dataChecker.tools.isOffsetNumber('10.5+0.5'));
            });
            it('"10+0.5" return true', function () {
                assert.equal(true, dataChecker.tools.isOffsetNumber('10+0.5'));
            });
            it('"10.5+1" return true', function () {
                assert.equal(true, dataChecker.tools.isOffsetNumber('10.5+1'));
            });
            it('"10-0.5" return true', function () {
                assert.equal(true, dataChecker.tools.isOffsetNumber('10-0.5'));
            });
            it('"10.5-1" return true', function () {
                assert.equal(true, dataChecker.tools.isOffsetNumber('10.5-1'));
            });
        });
        describe('isPositiveOffset', function () {
            it('"10+1" return false', function () {
                assert.equal(true, dataChecker.tools.isPositiveOffset('10+1'));
            });
            it('"10-1" return true', function () {
                assert.equal(false, dataChecker.tools.isPositiveOffset('10-1'));
            });
            it('"10+-1" return false', function () {
                assert.equal(false, dataChecker.tools.isPositiveOffset('10+-1'));
            });
            it('"10" return false', function () {
                assert.equal(false, dataChecker.tools.isPositiveOffset('10'));
            });
            it('"10a" return false', function () {
                assert.equal(false, dataChecker.tools.isPositiveOffset('10a'));
            });
            it('"10+0.5" return true', function () {
                assert.equal(true, dataChecker.tools.isPositiveOffset('10+0.5'));
            });
            it('"10.5+1" return true', function () {
                assert.equal(true, dataChecker.tools.isPositiveOffset('10.5+1'));
            });
            it('"10-0.5" return false', function () {
                assert.equal(false, dataChecker.tools.isPositiveOffset('10-0.5'));
            });
            it('"10.5-1" return false', function () {
                assert.equal(false, dataChecker.tools.isPositiveOffset('10.5-1'));
            });
        });
        describe('isNegativeOffset', function () {
            it('"10+1" return false', function () {
                assert.equal(false, dataChecker.tools.isNegativeOffset('10+1'));
            });
            it('"10-1" return true', function () {
                assert.equal(true, dataChecker.tools.isNegativeOffset('10-1'));
            });
            it('"10+-1" return false', function () {
                assert.equal(false, dataChecker.tools.isNegativeOffset('10+-1'));
            });
            it('"10" return false', function () {
                assert.equal(false, dataChecker.tools.isNegativeOffset('10'));
            });
            it('"10a" return false', function () {
                assert.equal(false, dataChecker.tools.isNegativeOffset('10a'));
            });
            it('"10+0.5" return false', function () {
                assert.equal(false, dataChecker.tools.isNegativeOffset('10+0.5'));
            });
            it('"10.5+1" return false', function () {
                assert.equal(false, dataChecker.tools.isNegativeOffset('10.5+1'));
            });
            it('"10-0.5" return true', function () {
                assert.equal(true, dataChecker.tools.isNegativeOffset('10-0.5'));
            });
            it('"10.5-1" return true', function () {
                assert.equal(true, dataChecker.tools.isNegativeOffset('10.5-1'));
            });
        });
        describe('isBothwayOffset', function () {
            it('"10+1" return false', function () {
                assert.equal(false, dataChecker.tools.isBothwayOffset('10+1'));
            });
            it('"10-1" return false', function () {
                assert.equal(false, dataChecker.tools.isBothwayOffset('10-1'));
            });
            it('"10+-1" return true', function () {
                assert.equal(true, dataChecker.tools.isBothwayOffset('10+-1'));
            });
            it('"10" return false', function () {
                assert.equal(false, dataChecker.tools.isBothwayOffset('10'));
            });
            it('"10a" return false', function () {
                assert.equal(false, dataChecker.tools.isBothwayOffset('10a'));
            });
            it('"10+0.5" return false', function () {
                assert.equal(false, dataChecker.tools.isBothwayOffset('10+0.5'));
            });
            it('"10.5+1" return false', function () {
                assert.equal(false, dataChecker.tools.isBothwayOffset('10.5+1'));
            });
            it('"10-0.5" return false', function () {
                assert.equal(false, dataChecker.tools.isBothwayOffset('10-0.5'));
            });
            it('"10.5-1" return false', function () {
                assert.equal(false, dataChecker.tools.isBothwayOffset('10.5-1'));
            });
            it('"10.5+-1" return true', function () {
                assert.equal(true, dataChecker.tools.isBothwayOffset('10.5+-1'));
            });
        });
    });

    describe.skip('Expression.compute', function () {
        describe.skip('$eq', function () {
            it('1080==1080 true', function () {
                var exp = new dataChecker.Expression({$eq: 1080});
                var rs  = exp.compute(1080, 'width');
                assert.equal(true, rs.rs, rs.tips);
            });
            it('1080==1000 false', function () {
                var exp = new dataChecker.Expression({$eq: 1080});
                var rs  = exp.compute(1000, 'width');
                assert.equal(false, rs.rs, rs.tips);
            });
            it.skip('"1080+100"==1000 false', function () {
                var exp = new dataChecker.Expression({$eq: "1080+100"});
                assert.equal(false, exp.compute(1000).rs);
            });
            it.skip('"1080-100"==1000 true', function () {
                var exp = new dataChecker.Expression({$eq: "1080-100"});
                assert.equal(true, exp.compute(1000).rs);
            });
            it.skip('"1080+-100"==1000 true', function () {
                var exp = new dataChecker.Expression({$eq: "1080+-100"});
                assert.equal(true, exp.compute(1000).rs);
            });
            it.skip('{value:1080}==1080 true', function () {
                var exp = new dataChecker.Expression({$eq: {value: 1080}});
                assert.equal(true, exp.compute(1080).rs);
            });
            it.skip('{value:1080}==1000 false', function () {
                var exp = new dataChecker.Expression({$eq: {value: 1080}});
                assert.equal(false, exp.compute(1000).rs);
            });
            it.skip('{value:1080,offset:100}==1000 true', function () {
                var exp = new dataChecker.Expression({$eq: {value: 1080, offset: 100}});
                assert.equal(true, exp.compute(1000).rs);
            });
            it.skip('{value:1080,offset:100}==900 false', function () {
                var exp = new dataChecker.Expression({$eq: {value: 1080, offset: 100}});
                assert.equal(false, exp.compute(900).rs);
            });

        });
        describe.skip('$lt', function () {
            var exp = new dataChecker.Expression({$lt: 1080});
            it('1000<1080 true', function () {
                assert.equal(true, exp.compute(1000).rs);
            });
            it('2000<1080 false', function () {
                assert.equal(false, exp.compute(2000).rs);
            });
            it('1080<1080 false', function () {
                assert.equal(false, exp.compute(1080).rs);
            });
        });
        describe.skip('$lte', function () {
            var exp = new dataChecker.Expression({$lte: 1080});
            it('1000<=1080 true', function () {
                assert.equal(true, exp.compute(1000).rs);
            });
            it('2000<=1080 false', function () {
                assert.equal(false, exp.compute(2000).rs);
            });
            it('1080<=1080 true', function () {
                assert.equal(true, exp.compute(1080).rs);
            });
        });
        describe.skip('$rt', function () {
            var exp = new dataChecker.Expression({$rt: 1080});
            it('1200>1080 true', function () {
                assert.equal(true, exp.compute(1200).rs);
            });
            it('1000>1080 false', function () {
                assert.equal(false, exp.compute(1000).rs);
            });
            it('1080>1080 false', function () {
                assert.equal(false, exp.compute(1080).rs);
            });
        });
        describe.skip('$rte', function () {
            var exp = new dataChecker.Expression({$rte: 1080});
            it('1200>=1080 true', function () {
                assert.equal(true, exp.compute(1200).rs);
            });
            it('1000>=1080 false', function () {
                assert.equal(false, exp.compute(1000).rs);
            });
            it('1080>=1080 true', function () {
                assert.equal(true, exp.compute(1080).rs);
            });
        });
        describe.skip('$scale', function () {
            var exp = new dataChecker.Expression({$scale: '16:9'});
            it('"16:9"=="16:9" true', function () {
                assert.equal(true, exp.compute('16:9').rs);
            });
            it('"16:9"=="16:8" false', function () {
                assert.equal(false, exp.compute('16:8').rs);
            });
            it('"16:9"=="16:a" false', function () {
                assert.equal(false, exp.compute('16:a').rs);
            });
            it('"16:9"=="16" false', function () {
                assert.equal(false, exp.compute('16').rs);
            });
        });
        describe.skip('$in', function () {
            it('1 in [1,2,3,4]=true', function () {
                var exp = new dataChecker.Expression({$in: [1, 2, 3, 4]});
                assert.equal(true, exp.compute(1).rs);
            });
            it('5 in [1,2,3,4]=false', function () {
                var exp = new dataChecker.Expression({$in: [1, 2, 3, 4]});
                assert.equal(false, exp.compute(5).rs);
            });
            it('1 in 1=true', function () {
                var exp = new dataChecker.Expression({$in: 1});
                assert.equal(true, exp.compute(1).rs);
            });
            it('aa in "aa"=true', function () {
                var exp = new dataChecker.Expression({$in: 'aa'});
                assert.equal(true, exp.compute('aa').rs);
            });
        });
        describe.skip('$and', function () {
            it('40=>{$and: [{$rt:10},{$lt:50}]}=true', function () {
                var exp = new dataChecker.Expression({$and: [{$rt: 10}, {$lt: 50}]});
                assert.equal(true, exp.compute(40).rs);
            });
            it('40=>{$and: [{$and:[{$rt:10}]},{$lt:50}]}=true', function () {
                var exp = new dataChecker.Expression({$and: [{$and: [{$rt: 10}]}, {$lt: 50}]});
                assert.equal(true, exp.compute(40).rs);
            });
            it('80=>[{$rt:10},{$lt:50}]=false', function () {
                var exp = new dataChecker.Expression({$and: [{$rt: 10}, {$lt: 50}]});
                assert.equal(false, exp.compute(80).rs);
            });
        });
        describe.skip('$or', function () {
            it('40=>{$or: [{$rt:10},{$lt:50}]}=true', function () {
                var exp = new dataChecker.Expression({$or: [{$rt: 10}, {$lt: 50}]});
                assert.equal(true, exp.compute(40).rs);
            });
            it('40=>{$or: [{$rt:10},{$rt:50},{$eq:90}]}=true', function () {
                var exp = new dataChecker.Expression({$or: [{$rt: 10}, {$rt: 50}, {$eq: 90}]});
                assert.equal(true, exp.compute(140).rs);
            });
            it('40=>{$and: [{$and:[{$rt:10}]},{$lt:50}]}=true', function () {
                var exp = new dataChecker.Expression({$or: [{$and: [{$rt: 10}]}, {$lt: 50}]});
                assert.equal(true, exp.compute(40).rs);
            });
            it('80=>[{$rt:10},{$lt:50}]=false', function () {
                var exp = new dataChecker.Expression({$or: [{$rt: 10}, {$lt: 50}]});
                assert.equal(true, exp.compute(80).rs);
            });
        });
        describe.skip('$needless', function () {
            it('80=>{$needless:{$eq:50}}=false', function () {
                var exp = new dataChecker.Expression({$needless: {$eq: 50}});
                assert.equal(false, exp.compute(80).rs);
            });
            it('50=>{$required:true}=true', function () {
                var exp = new dataChecker.Expression({$needless: {$eq: 50}});
                assert.equal(true, exp.compute(50).rs);
            });
            it('50=>{$required:true}=true', function () {
                var exp = new dataChecker.Expression({$needless: {$eq: 50}});
                assert.equal(true, exp.compute(50).rs);
            });
        })
    });
    describe('ADDataCheck', function () {


        var rules = {
            video: {
                width : 1080,
                height: 720,
                scale : {$scale: '16:9'},
                size  : {$lte: 10},
                time  : '15000+-100',
                ext   : {$in: ['flv', 'mp4']}
            },
            text : {
                length: 100
            }
        };
        it('should return true', function () {
            var datas = {
                video: {
                    width : 1000,
                    height: 720,
                    scale : '16:9',
                    size  : 8,
                    time  : 14950,
                    ext   : 'mp4'
                },
                text : {
                    length: 100
                }
            };
            var rs    = dataChecker.ADDataCheck(datas, rules);
            if (!rs.rs) {
                console.error('dataCheck:Error:', rs.tips);
            }
            assert.equal(false, rs.rs);
        });

        it('should return true', function () {
            var datas = {
                video: {
                    width : 1080,
                    height: 720,
                    scale : '16:9',
                    size  : 8,
                    time  : 14950,
                    ext   : 'mp4'
                },
                text : {
                    length: 100
                }
            };
            var rs    = dataChecker.ADDataCheck(datas, rules);
            if (!rs.rs) {
                console.log(rs.tips);
            }
            assert.equal(true, rs.rs);
        });
    })
});