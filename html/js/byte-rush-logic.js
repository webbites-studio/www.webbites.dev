(function (root, factory) {
    var logic = factory();
    if (typeof module === 'object' && module.exports) module.exports = logic;
    if (root) root.ByteRushLogic = logic;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    function depthAtY(y, horizonY, trackDepth) {
        return Math.pow((y - horizonY) / trackDepth, 2 / 3);
    }

    function crossesDepth(previousZ, currentZ, targetZ) {
        return previousZ < targetZ && currentZ >= targetZ;
    }

    return {
        depthAtY: depthAtY,
        crossesDepth: crossesDepth
    };
});
