# Data Directory

Do not manually paste unverified research links into production data.

Expected structure:

```text
data/
  graph.json
  nodes/
    <node-id>.json
  guides/
    <guide-id>.md
```

Run the content validator before committing data.

A resource marked `pending` is not public Viewer content.
