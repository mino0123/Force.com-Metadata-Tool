describe("core", function () {
    describe("clone", function () {
        it("should returns cloned value", function () {
            var obj = {
                str: 'string',
                bool: true,
                num: 12345,
                fun: function () {},
                arr: [1, 2],
                obj: {s: 's', b: true, n: 1}
            };
            var r = clone(obj);
            expect(r.str).to.equal('string');
            expect(r.bool).to.equal(true);
            expect(r.num).to.equal(12345);
            expect(r.fun).to.equal(obj.fun);
            expect(r.arr[0]).to.equal(1);
            expect(r.arr[1]).to.equal(2);
            expect(r.obj.s).to.equal('s');
            expect(r.obj.b).to.equal(true);
            expect(r.obj.n).to.equal(1);
        });
    });
    describe("arrayToHash", function () {
        it("should convert array to hash", function () {
            var arr, r,
            arr = [
                {key: 'aaa'},
                {key: 'bbb'},
                {key: 'ccc'}
            ];
            r = arrayToHash(arr, 'key');
            expect(r.aaa).to.equal(arr[0]);
            expect(r.bbb).to.equal(arr[1]);
            expect(r.ccc).to.equal(arr[2]);
        });
    });
    describe("arrayDivide", function () {
        it("should divide array", function () {
            var r = arrayDivide([1,2,3,4,5], 3);
            expect(r[0].length).to.equal(3);
            expect(r[0][0]).to.equal(1);
            expect(r[0][1]).to.equal(2);
            expect(r[0][2]).to.equal(3);
            expect(r[1].length).to.equal(2);
            expect(r[1][0]).to.equal(4);
            expect(r[1][1]).to.equal(5);
            expect(r[1][2]).to.equal(undefined);
        });
    });
});