export default class NotificationMessage {
  static currentNotification = null;

  constructor(message = "", { type = "success", duration = 3000} = {}) {
    this.message = message;
    this.type = type;
    this.duration = duration;
    this.render();
  }

  getTemplate() {
    return `
    <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
            <div class="notification-header">${this.type}</div>
            <div class="notification-body">
                ${this.message} ${new Date()}
            </div>
        </div>
    </div>
    `;
  }

  render() {
    const tmp = document.createElement('div');
    tmp.innerHTML = this.getTemplate();
    this.element = tmp.firstElementChild;
  }
  show(parent = document.body) {
    if (NotificationMessage.currentNotification) {
      NotificationMessage.currentNotification.remove();
    }

    parent.appendChild(this.element);
    NotificationMessage.currentNotification = this;

    this.timer = setTimeout(() => {
      this.remove();
    }, this.duration);
  }

  remove() {
    clearTimeout(this.timer);
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
