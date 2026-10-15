// player.js — Điều khiển phát lại trace: Tiến / Lùi / Tự chạy.
// Không chạy thuật toán, không đụng DOM: chỉ giữ chỉ số bước hiện tại và gọi onChange.

export class Player {
  /** @param {(index:number, player:Player) => void} onChange gọi mỗi khi bước hoặc trạng thái phát thay đổi */
  constructor(onChange) {
    this.onChange = onChange;
    this.trace = [];
    this.index = 0;
    this.timer = null;
    this.delay = 800; // mili giây giữa hai bước khi tự chạy
  }

  get length() {
    return this.trace.length;
  }

  get playing() {
    return this.timer !== null;
  }

  get atEnd() {
    return this.index >= this.length - 1;
  }

  /** Nạp trace mới và về bước đầu. */
  load(trace) {
    this.#stopTimer();
    this.trace = trace;
    this.index = 0;
    this.#emit();
  }

  goto(i) {
    if (this.length === 0) return;
    this.index = Math.max(0, Math.min(this.length - 1, i));
    this.#emit();
  }

  next() {
    if (this.atEnd) return false;
    this.goto(this.index + 1);
    return true;
  }

  prev() {
    this.goto(this.index - 1);
  }

  first() {
    this.goto(0);
  }

  last() {
    this.goto(this.length - 1);
  }

  /** Tự chạy; nếu đang ở bước cuối thì phát lại từ đầu. */
  play() {
    if (this.length === 0 || this.playing) return;
    if (this.atEnd) this.index = 0;
    this.#startTimer();
    this.#emit();
  }

  pause() {
    if (!this.playing) return;
    this.#stopTimer();
    this.#emit();
  }

  toggle() {
    if (this.playing) this.pause();
    else this.play();
  }

  setDelay(ms) {
    this.delay = ms;
    if (this.playing) {
      this.#stopTimer();
      this.#startTimer();
    }
  }

  #tick = () => {
    this.next();
    if (this.atEnd) this.pause();
  };

  #startTimer() {
    this.timer = setInterval(this.#tick, this.delay);
  }

  #stopTimer() {
    clearInterval(this.timer);
    this.timer = null;
  }

  #emit() {
    this.onChange(this.index, this);
  }
}
