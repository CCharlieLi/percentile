'use strict';

const should = require('chai').should();
const { Percentile } = require('../');

describe('Percentile', () => {
  let p;
  let wp;
  beforeEach('init data', () => {
    p = new Percentile();
    wp = new Percentile(1000, 10);
  });

  it('should handle single value', () => {
    p.push(1);
    p.compress();
    p.percentile(0.0).should.be.equal(1);
    p.percentile(0.5).should.be.equal(1);
    p.percentile(1.0).should.be.equal(1);
  });

  it('should get percentile of single window bucket',  () => {
    for (let i = 0; i < 5; i++) {
      p.push(i);
    }
    p.compress();
    p.windowBuckets.length.should.be.equal(1);
    p.isWindowPercentile.should.be.equal(false);
    p.percentile(0.25).should.be.equal(0.75);
    p.percentile(0.5).should.be.equal(2);
    p.percentile(0.75).should.be.equal(3.25);
    p.percentile(0.95).should.be.equal(4);
  });

  it('should get percentile from large data', () => {
    const data = require('./data');
    for (let i of data) {
      p.push(i);
    }
    p.compress();
    p.windowBuckets.length.should.be.equal(1);
    p.isWindowPercentile.should.be.equal(false);
    p.percentile(0.5).should.be.closeTo(5, 0.5);
    p.percentile(0.9).should.be.closeTo(16, 0.5);
    p.percentile(0.99).should.be.closeTo(223, 0.5);
    // perc50: 5
    // perc90: 16
    // perc99: 223
  });

  it('should get percentilr of windown buckets', () => {
    const data = require('./data');
    wp.windowBuckets.length.should.be.equal(10);
    wp.isWindowPercentile.should.be.equal(true);

    let count = 0;
    while (count < 100) {
      for (let i of data) {
        wp.push(i);
      }
      wp.compress();
      // console.log(wp.currentBucketIndex);
      count++;
    }

    wp.percentile(0.5).should.be.closeTo(5, 0.5);
    wp.percentile(0.9).should.be.closeTo(16, 0.5);
    wp.percentile(0.99).should.be.closeTo(223, 0.5);
  });
});
