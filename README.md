#### Provide **urls** the desired links to be crawled.

When *crawl()* starts executing, it will keep on populating **urls** with new unvisited URLs. The recursion should stop when **urls** is empty (that takes a quite some time...).

If a link is not responding, it will try fetching the resource 3 times until marking the link as visited and moving on.

**MAX_PARALLEL_REQUESTS** (default 20) requests can be made in parallel.

**MAX_HOST_PARALLEL_REQUESTS** (default 4) requests on the same host can be made in parallel.

*happy crawling*