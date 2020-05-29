#### Provide **urls** the desired links to be crawled.

When *crawl()* starts executing, it will keep on populating **urls** with new unvisited URLs. The recursion should stop when **urls** is empty (that takes a quite some time...).

If a link is not responding, it will try fetching the resource 3 times until marking the link as visited and moving on.