export default {
  listitem(text: string, task: any) {
    if (task) {
      return '<li class="task-list-item">' + text + "</li>\n";
    } else {
      return false;
    }
  },
};
