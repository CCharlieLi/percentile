"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Percentile = void 0;
const TDigest = require("tdigest").TDigest;
class Percentile {
    /**
     * Initiate T-Digest based Percentile instance
     * @param windowLiveTimeMS the TTL of data in a window bucket, in milliSecond
     * @param bucketsNum number of window buckets
     */
    constructor(windowLiveTimeMS = 0, bucketsNum = 0) {
        // Use single bucket (non window percentile) if no params provided
        this.windowLiveTimeMS = windowLiveTimeMS;
        this.bucketsNum = bucketsNum;
        this.isWindowPercentile = !!windowLiveTimeMS && !!bucketsNum;
        // Initiate window buckets
        this.windowBuckets = Array(bucketsNum || 1).fill(new TDigest());
        this.currentBucketIndex = 0;
        // Initiate window rotate data
        this.lastRotateTime = Date.now();
        this.rotateTime = (windowLiveTimeMS / bucketsNum) || Infinity;
    }
    /**
     * Rotate window and get current bucket
     */
    rotate() {
        let timeGap = Date.now() - this.lastRotateTime;
        while (this.isWindowPercentile && timeGap > this.rotateTime) {
            // Refresh current window bucket and move to next one
            this.windowBuckets[this.currentBucketIndex] = new TDigest();
            this.currentBucketIndex++;
            // Rotate if reached the end
            this.currentBucketIndex =
                this.currentBucketIndex >= this.windowBuckets.length
                    ? 0
                    : this.currentBucketIndex;
            // Update time gap
            timeGap -= this.rotateTime;
            this.lastRotateTime += this.rotateTime;
        }
        return this.windowBuckets[this.currentBucketIndex];
    }
    percentile(quantile) {
        const bucket = this.rotate();
        return bucket.percentile(quantile);
    }
    push(value) {
        this.rotate();
        this.windowBuckets.forEach((bucket) => bucket.push(value));
    }
    reset() {
        this.windowBuckets.forEach((bucket) => bucket.reset());
    }
    compress() {
        this.windowBuckets.forEach((bucket) => bucket.compress());
    }
}
exports.Percentile = Percentile;
