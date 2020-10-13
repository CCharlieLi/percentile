# Percentile

[![Build Status](https://travis-ci.com/CCharlieLi/percentile.svg?branch=main)](https://travis-ci.com/CCharlieLi/percentile)
[![Coverage Status](https://coveralls.io/repos/github/CCharlieLi/percentile/badge.svg?branch=master)](https://coveralls.io/github/CCharlieLi/percentile?branch=master)

Percentile is a frequently-used metrics in cases like analyzing service response time, where we are specifically interested in those edge cases that response in a significant time. In the real world, there are always tremendous data/logs/files to be analyzed which makes it impossible to load the whole data into system to process and calculate percentile in the [traditional way]([Percentile - Wikipedia](https://en.wikipedia.org/wiki/Percentile#The_nearest-rank_method)). Instead, we need an algorithm that can calculate percentile on stream data with limited CPU and RAM consuming, but also trade the accuracy and get an approximate result with an acceptable deviation. There are already many algorithm to handle percentile calculation on stream data, e.g.   [HdrHistogram](https://github.com/HdrHistogram/HdrHistogram) , [GK](https://www.cis.upenn.edu/~sanjeev/papers/sigmod01_quantiles.pdf), [CKMS](http://dimacs.rutgers.edu/~graham/pubs/papers/bquant-icde.pdf), [T-Digest](https://raw.githubusercontent.com/tdunning/t-digest/master/docs/t-digest-paper/histo.pdf).

With the inspiration of the [Prometheus node client]([GitHub - siimon/prom-client: Prometheus client for node.js](https://github.com/siimon/prom-client))  I have implemented the percentile library based on [T-Digest](https://raw.githubusercontent.com/tdunning/t-digest/master/docs/t-digest-paper/histo.pdf) algorithm which also support window buckets, that in most cases we are not only interested in the percentile of overall data but the most recent ones. In the worst case, [T-Digest](https://raw.githubusercontent.com/tdunning/t-digest/master/docs/t-digest-paper/histo.pdf)  would have a time complexity at `O(nlogn)`  while the memory usage is related to the compression which by default is 100, the number of nodes in [T-Digest](https://raw.githubusercontent.com/tdunning/t-digest/master/docs/t-digest-paper/histo.pdf)  is limited within 20 * compression, giving that one node is occupying approximate 32 byte, in theory the worst case would need 64KB.

References:

- [Quantiles on Streams](https://sites.cs.ucsb.edu/~suri/psdir/ency.pdf)
- [Quantiles over Data Streams: Experimental Comparisons, NewAnalyses, and Further Improvements](http://dimacs.rutgers.edu/~graham/pubs/papers/nquantvldbj.pdf)
- [t-digest](https://github.com/tdunning/t-digest#t-digest)
- https://www.stevenengelhardt.com/posts/
- https://www.elastic.co/guide/cn/elasticsearch/guide/current/percentiles.html
- https://caorong.github.io/2020/08/03/quartile-%20algorithm/
- https://blog.bcmeng.com/post/tdigest.html


## How to use

```js
const { Percentile } = require('t-percentile');

// Init single bucket instance
const p = new Percentile();

// Init multi bucket instance with parameters:
// windowLiveTimeMS - the TTL of data in a window bucket, in milliSecond
// bucketsNum - number of window buckets
const wp = new Percentile(1000, 10);

// Push data
for (let i = 0; i < 10000; i++) {
  p.push(i);
  wp.push(i);
}
p.compress();
wp.compress();

console.log(p.percentile(0.9));
console.log(wp.percentile(0.9));
```

## How to test

```
yarn
yarn test
```

## [License](https://github.com/CCharlieLi/percentile/blob/main/LICENSE)