# Seaqull

**Project status**: Early work in progress.

Seaqull is a simpler, faster, more interactive way to query databases for analytical purposes.

You can try it out with SQLite from the browser: https://xixixao.github.io/seaqull

If you're interested in using Seaqull with other databases, or via a server, please [reach out](https://github.com/xixixao/).

## User Guide

Seaqull's interface has two halves, on top is the _node editor_ and at the bottom is the _results view_.

### Choosing a database

In the SQLite version of Seaqull you can either choose to explore the example database or load your own. Your data stays on your device, and is never forwarded to any server (there is no server connected to the site).

You can do this via the `?` button in top right corner.

Your queries are stored in your browser, but if you're using your own database, you'll have to select it every time you open Seaqull.

### Starting a query

Click on the `+ FROM` button or double click anywhere in the _node editor_.

You can either type in the name of the table you're interested in or click on one of the table names in the _results view_.

### Building a query

Once you have a valid `FROM` node that shows some results, you can build your query by adding to it. Choose from one of the buttons shown below it. For example the `+ WHERE` button will attach a `WHERE` node that filters which rows will be shown.

You can also use the keys <kbd>W</kbd>/<kbd>G</kbd>/<kbd>S</kbd>/<kbd>O</kbd> to add a corresponding node.

Every node type can be edited by either typing into it or by using the UI in the _results view_. You should be able to write any valid query using the node input, and compose most common queries using the _results view_.

### Navigating and modifying queries

Click on a node to see the results your query generates up until that point.

Click on a node to select it.

Use the <kbd>Backspace</kbd>/<kbd>delete</kbd> key to delete all selected nodes.

To select multiple nodes, hold the <kbd>Ctrl</kbd>/<kbd>command</kbd> key while clicking a node. When two nodes are selected results from both are shown.

To select many nodes, hold the <kbd>Shift</kbd> key while clicking and dragging the cursor to draw a selection box.

You can drag any selected node to move all selected nodes and all the nodes belonging to the same query. The position of nodes inside the _node editor_ has no impact on the results shown.

### Joining queries

To combine results from multiple tables, first select two nodes that don't belong to the same query. Then click on the `+ JOIN` button under either node.

### Splitting queries

You can split one query into two, to reuse nodes without having to copy them. To do this, hold down the <kbd>Alt</kbd>/<kbd>option</kbd> key and drag the node which will start the new query. You can select multiple nodes from the same query to move them out to a new query.

Moving nodes out to a separate query has no impact on the results they generate.

### Merging queries

To combine nodes back together into one query, hold down the <kbd>Alt</kbd>/<kbd>option</kbd> and drag the nodes you want to merge to the last node of the destination query. When you release the cursor the nodes will snap together to form one query.

You can merge nodes that were already linked together or not. Moving nodes this way is similar to moving lines of code in a text editor.

### Editing nodes

To edit the code in a node click on it.

To confirm the change either move the cursor outside of the node, or press <kbd>Ctrl</kbd>/<kbd>command</kbd>+<kbd>Enter</kbd>.
