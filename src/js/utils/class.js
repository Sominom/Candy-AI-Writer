class UndoTemp {
  constructor(content) {
    this.undoTemp = [content];
  }

  push(value) {
    this.undoTemp.push(value);
  }

  pop() {
    if (this.undoTemp.length > 0) {
      this.undoTemp.pop();
    }

  }

  get() {
    return this.undoTemp[this.undoTemp.length - 1];
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
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = value;
    this.content = tempDiv.textContent || tempDiv.innerText || '';
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