export default {
  listitem(text: string, task: any) {
    const id = Math.random().toString(36).substring(2); // 生成一个随机 ID
    const t = text.replace(`disabled=""`, `id="${id}"`);

    if (task) {
      return `
        <li class="task-list-item">
          <label class="task-list-item-label" for="${id}">${t}</label>
        </li>
      `;
    } else {
      return `<li>${t}</li>`;
    }
  },
};
