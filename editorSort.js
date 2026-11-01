module.exports = {
  default: function (context) {
    return {
      plugin: function (codeMirror) {
        codeMirror.registerCommand("checklistSorter.apply", async function () {
          let status = "failed";
          try {
            const job = await context.postMessage("pending");
            const view = codeMirror.editor;
            if (job && view && view.state && view.dispatch) {
              const current = view.state.doc.toString();
              if (current !== job.old) {
                status = "skip";
              } else {
                const a = job.old;
                const b = job.new;
                const max = Math.min(a.length, b.length);
                let start = 0;
                while (start < max && a.charCodeAt(start) === b.charCodeAt(start)) start++;
                let endA = a.length;
                let endB = b.length;
                while (endA > start && endB > start && a.charCodeAt(endA - 1) === b.charCodeAt(endB - 1)) {
                  endA--;
                  endB--;
                }
                view.dispatch({
                  changes: { from: start, to: endA, insert: b.slice(start, endB) },
                  userEvent: "input.checklistSorter",
                });
                status = "applied";
              }
            }
          } catch (e) {
            status = "failed";
          }
          try {
            await context.postMessage(status);
          } catch (e) {}
          return status;
        });
      },
    };
  },
};
