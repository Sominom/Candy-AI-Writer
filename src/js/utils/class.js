class UndoTemp {
  constructor(content) {
    this.undoTemp = [content];
  }

  push(value) {
    this.undoTemp.push(value);
  }

  pop() {
    if (this.undoTemp.length > 1) {
      this.undoTemp.pop();
    }

  }

  get() {
    return this.undoTemp.join('');
  }
}

class BodyContent {
  constructor(content) {
    this.content = content;
  }

  append(value) {
    this.content += value;
  }

  set(value) {
    this.content = value;
  }

  get() {
    return this.content;
  }

  getHtml() {
    return "<span style='color:black'>" + this.content + "</span>";
  }
}

export {
  UndoTemp,
  BodyContent
}