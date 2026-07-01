const STORAGE_KEY = "oshikatsu-landscape-prototype-v1";

const labels = {
  weather: {
    clear: "晴れ",
    cloudy: "くもり",
    rain: "雨",
    fog: "霧",
    storm: "嵐",
    dawn: "夜明け",
    sunset: "夕焼け",
    night: "夜",
  },
  wave: {
    calm: "穏やか",
    restless: "少しざわざわ",
    rough: "大きく揺れている",
  },
  recordType: {
    inner: "内側の記録",
    outer: "外側の記録",
    both: "両方の記録",
  },
  shape: {
    triangle: "三角形",
    circle: "円",
    venn: "ベン図",
  },
};

const app = document.querySelector("#app");
const views = document.querySelectorAll(".view");
const homeSky = document.querySelector("#home-sky");
const homeSea = document.querySelector("#home-sea");
const homeWeatherForm = document.querySelector("#home-weather-form");
const homeWeatherSelect = document.querySelector("#home-weather-select");
const starField = document.querySelector("#star-field");
const layerStack = document.querySelector("#home-layer-stack");
const placedShapes = document.querySelector("#placed-shapes");
const creatureMessage = document.querySelector("#creature-message");
const diaryForm = document.querySelector("#diary-form");
const diaryStatus = document.querySelector("#diary-status");
const diarySubmitButton = diaryForm.querySelector('button[type="submit"]');
const diaryRecordTypeSelect = diaryForm.querySelector('[name="recordType"]');
const diaryBodySingle = diaryForm.querySelector('[data-body-mode="single"]');
const diaryBothFields = diaryForm.querySelector('[data-body-mode="both"]');
const diaryBodyInput = diaryForm.querySelector('[name="body"]');
const diaryInnerBodyInput = diaryForm.querySelector('[name="innerBody"]');
const diaryOuterBodyInput = diaryForm.querySelector('[name="outerBody"]');
const quickWeatherForm = document.querySelector("#quick-weather-form");
const quickWeatherSelect = document.querySelector("#quick-weather-select");
const quickWeatherStatus = document.querySelector("#quick-weather-status");
const freeMemoForm = document.querySelector("#free-memo-form");
const freeMemoInput = document.querySelector("#free-memo-input");
const freeMemoStatus = document.querySelector("#free-memo-status");
const shapeForm = document.querySelector("#shape-form");
const shapeStatus = document.querySelector("#shape-status");
const shapeSubmitButton = shapeForm.querySelector('button[type="submit"]');
const shapeKindInput = document.querySelector("#shape-kind");
const shapePreview = document.querySelector("#shape-preview");
const atelierQuestion = document.querySelector("#atelier-question");
const shapeSaveEffect = document.querySelector("#shape-save-effect");
const galleryList = document.querySelector("#gallery-list");
const strataList = document.querySelector("#strata-list");
const settingsPlacedList = document.querySelector("#settings-placed-list");
const resetDataButton = document.querySelector("#reset-data-button");
const resetStatus = document.querySelector("#reset-status");
const shapeTabs = document.querySelectorAll(".shape-tab");

const atelierQuestions = {
  triangle: [
    "今の関係を三角形にすると？",
    "近いけど遠いものは？",
    "自分・推し・外側のあいだに、どんな線がありますか？",
    "向かっている気持ちと、返ってくるものは？",
  ],
  circle: [
    "内側に残したいものは？",
    "外側に置いておきたいものは？",
    "今、核だと感じているものは？",
    "境目をゆっくり見たら、何が見えますか？",
  ],
  venn: [
    "好きの重なりを見てみる",
    "同じところと、違うところを置いてみる",
    "重ならない部分も、まちがいではありません",
    "外側にあるものも、必要なら置いておけます",
  ],
};

let state = loadState();
let editingDiaryId = null;
let editingShapeId = null;

bindNavigation();
bindDiaryForm();
bindHomeWeatherForm();
bindQuickWeatherForm();
bindFreeMemoForm();
bindShapeForm();
bindShapeTabs();
bindSettingsControls();
renderAll();
updateShapePreview();
renderAtelierQuestion();

function defaultState() {
  return {
    diaries: [],
    shapes: [],
    freeMemo: "",
    weather: "clear",
    wave: "calm",
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return defaultState();
    }
    return {
      ...defaultState(),
      ...JSON.parse(saved),
    };
  } catch {
    return defaultState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    showMessage(diaryStatus, "保存できませんでした。ブラウザの保存容量を確認してください。");
  }
}

function bindNavigation() {
  app.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-view]");
    if (!trigger) {
      return;
    }
    showView(trigger.dataset.view);
  });
}

function showView(viewName) {
  views.forEach((view) => {
    view.classList.toggle("active", view.id === `${viewName}-view`);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function bindDiaryForm() {
  diaryRecordTypeSelect.addEventListener("change", syncDiaryBodyFields);
  syncDiaryBodyFields();

  diaryForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(diaryForm);
    const recordType = formData.get("recordType") || "inner";
    const body = getFormText(formData, "body");
    const innerBody = getFormText(formData, "innerBody");
    const outerBody = getFormText(formData, "outerBody");

    if (recordType === "both" && !innerBody && !outerBody) {
      showMessage(diaryStatus, "内側か外側のどちらかに、少しだけ記録を置いてください。");
      return;
    }

    if (recordType !== "both" && !body) {
      showMessage(diaryStatus, "本文を少しだけ入力してください。");
      return;
    }

    const existingDiary = state.diaries.find((item) => item.id === editingDiaryId);
    const diary = {
      id: existingDiary?.id || createId(),
      title: getFormText(formData, "title") || "名前のない記録",
      body: recordType === "both" ? "" : body,
      innerBody: recordType === "both" ? innerBody : "",
      outerBody: recordType === "both" ? outerBody : "",
      recordType,
      weather: formData.get("weather") || "clear",
      wave: formData.get("wave") || "calm",
      important: formData.get("important") === "on",
      createdAt: existingDiary?.createdAt || new Date().toISOString(),
      updatedAt: existingDiary ? new Date().toISOString() : "",
    };

    if (existingDiary) {
      state.diaries = state.diaries.map((item) => (item.id === diary.id ? diary : item));
    } else {
      state.diaries = [diary, ...state.diaries];
    }

    state.weather = diary.weather;
    state.wave = diary.wave;
    saveState();
    diaryForm.reset();
    editingDiaryId = null;
    diarySubmitButton.textContent = "記録を地層に積む";
    syncDiaryBodyFields();
    renderAll();

    const message = existingDiary
      ? "記録を更新しました。"
      : diary.important
        ? "記録がひとつ、地層に積もりました。大切な記録が、星になりました。"
        : "記録がひとつ、地層に積もりました。";
    showMessage(diaryStatus, message);
  });
}

function bindHomeWeatherForm() {
  homeWeatherForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(homeWeatherForm);
    state.weather = formData.get("weather") || "clear";
    saveState();
    renderAll();
  });
}

function bindQuickWeatherForm() {
  quickWeatherForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(quickWeatherForm);
    state.weather = formData.get("weather") || "clear";
    saveState();
    renderAll();
    showMessage(quickWeatherStatus, "空の見え方を変えました。");
  });
}

function bindFreeMemoForm() {
  freeMemoForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(freeMemoForm);
    state.freeMemo = getFormText(formData, "freeMemo");
    saveState();
    showMessage(freeMemoStatus, "フリーメモを残しました。");
  });
}

function bindShapeForm() {
  shapeForm.addEventListener("input", updateShapePreview);

  shapeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(shapeForm);
    const kind = formData.get("kind") || "triangle";
    const existingShape = state.shapes.find((item) => item.id === editingShapeId);
    const shape = {
      id: existingShape?.id || createId(),
      type: kind,
      kind,
      title: getFormText(formData, "title") || "名前のないかたち",
      memo: getFormText(formData, "memo"),
      placeInLandscape: formData.get("placeInLandscape") === "on",
      placedInLandscape: formData.get("placeInLandscape") === "on",
      createdAt: existingShape?.createdAt || new Date().toISOString(),
      updatedAt: existingShape ? new Date().toISOString() : "",
    };

    if (kind === "triangle") {
      shape.points = {
        a: getFormText(formData, "pointA") || "自分",
        b: getFormText(formData, "pointB") || "推し",
        c: getFormText(formData, "pointC") || "第三者",
      };
      shape.arrows = getTriangleArrows(formData);
    } else if (kind === "circle") {
      shape.circle = {
        hasCore: formData.get("circleHasCore") === "on",
        core: getFormText(formData, "circleCore"),
        inner: getTextList(formData, ["circleInner1", "circleInner2", "circleInner3"]),
        outer: getTextList(formData, ["circleOuter1", "circleOuter2", "circleOuter3"]),
      };
    } else if (kind === "venn") {
      Object.assign(shape, getVennFields(formData));
    }

    if (existingShape) {
      state.shapes = state.shapes.map((item) => (item.id === shape.id ? shape : item));
    } else {
      state.shapes = [shape, ...state.shapes];
    }

    saveState();
    shapeForm.reset();
    editingShapeId = null;
    shapeSubmitButton.textContent = "かたちを保存する";
    selectShapeKind("triangle");
    renderAll();
    updateShapePreview();
    playShapeSaveEffect();

    const message = existingShape
      ? "かたちを更新しました。"
      : shape.placeInLandscape
        ? "かたちを保存して、風景に置きました。"
        : "かたちを保存しました。";
    showMessage(shapeStatus, message);
  });
}

function bindShapeTabs() {
  shapeTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      selectShapeKind(tab.dataset.shapeKind);
      updateShapePreview();
    });
  });
}

function selectShapeKind(kind) {
  shapeKindInput.value = kind;
  shapeTabs.forEach((tab) => {
    const isActive = tab.dataset.shapeKind === kind;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
  document.querySelectorAll(".shape-fields").forEach((fields) => {
    fields.classList.toggle("active", fields.dataset.fields === kind);
  });
  renderAtelierQuestion();
}

function bindSettingsControls() {
  resetDataButton.addEventListener("click", () => {
    const ok = window.confirm(
      "このブラウザ内に保存した日記・かたち・風景の状態をすべて消します。元には戻せません。リセットしますか。"
    );

    if (!ok) {
      return;
    }

    state = defaultState();
    saveState();
    editingDiaryId = null;
    editingShapeId = null;
    diaryForm.reset();
    freeMemoForm.reset();
    shapeForm.reset();
    diarySubmitButton.textContent = "記録を地層に積む";
    shapeSubmitButton.textContent = "かたちを保存する";
    syncDiaryBodyFields();
    selectShapeKind("triangle");
    renderAll();
    updateShapePreview();
    showMessage(resetStatus, "保存データをリセットしました。");
  });
}

function renderAll() {
  renderHome();
  renderGallery();
  renderSettings();
  renderStrata();
}

function renderHome() {
  app.dataset.weather = state.weather;
  app.dataset.wave = state.wave;
  homeSky.className = `sky weather-${state.weather}`;
  homeSea.className = `sea wave-${state.wave}`;
  homeWeatherSelect.value = state.weather;
  quickWeatherSelect.value = state.weather;
  if (document.activeElement !== freeMemoInput) {
    freeMemoInput.value = state.freeMemo || "";
  }
  renderStars();
  renderHomeLayers();
  renderPlacedShapes();
  renderCreatureMessage();
}

function renderStars() {
  starField.innerHTML = "";
  state.diaries
    .filter((diary) => diary.important)
    .slice(0, 28)
    .forEach((diary, index) => {
      const star = document.createElement("span");
      const position = seededPosition(diary.id, index);
      star.className = "star";
      star.title = diary.title;
      star.style.left = `${position.left}%`;
      star.style.top = `${position.top}%`;
      star.style.setProperty("--star-size", `${position.size}px`);
      starField.append(star);
    });
}

function renderHomeLayers() {
  layerStack.innerHTML = "";
  if (state.diaries.length === 0) {
    ["inner", "outer", "both"].forEach((type) => {
      const layer = document.createElement("span");
      layer.className = `home-layer layer-${type} muted`;
      layerStack.append(layer);
    });
    return;
  }

  state.diaries.slice(0, 10).reverse().forEach((diary) => {
    const layer = document.createElement("span");
    layer.className = `home-layer layer-${diary.recordType}`;
    if (diary.important) {
      layer.classList.add("layer-starred");
    }
    layer.title = diary.title;
    layerStack.append(layer);
  });
}

function renderPlacedShapes() {
  placedShapes.innerHTML = "";
  const placed = state.shapes.filter((shape) => isShapePlaced(shape));

  if (placed.length === 0) {
    const empty = document.createElement("span");
    empty.className = "placed-empty";
    empty.textContent = "今日はまだ、かたちは置かれていません。";
    placedShapes.append(empty);
    return;
  }

  placed.slice(0, 5).forEach((shape, index) => {
    const item = document.createElement("button");
    const position = seededPosition(shape.id, index + 3);
    item.type = "button";
    item.className = "placed-shape";
    item.title = shape.title;
    item.setAttribute("aria-label", `${shape.title}を美術館で見る`);
    item.style.left = `${position.left}%`;
    item.style.top = `${18 + ((position.top + index * 9) % 45)}%`;
    item.innerHTML = `
      ${renderShapeSvg(shape, "mini")}
      <span>${escapeHtml(shortText(shape.title, "かたち", 8))}</span>
    `;
    item.addEventListener("click", () => showView("gallery"));
    placedShapes.append(item);
  });
}

function renderCreatureMessage() {
  const importantCount = state.diaries.filter((diary) => diary.important).length;
  const placedCount = state.shapes.filter((shape) => isShapePlaced(shape)).length;
  const latestDiary = state.diaries[0];

  if (state.diaries.length === 0) {
    creatureMessage.textContent = state.freeMemo
      ? "メモの小さな置き場、ちゃんとあります。"
      : "書けるところからで大丈夫です。";
  } else if (latestDiary?.important) {
    creatureMessage.textContent = "星になった記録が、空の端にいます。";
  } else if (state.weather === "rain" || state.weather === "fog") {
    creatureMessage.textContent = "見えにくい日も、置いたものは残っています。";
  } else if (state.weather === "night" && importantCount > 0) {
    creatureMessage.textContent = "星は、少し小さくても見えています。";
  } else if (placedCount > 0) {
    creatureMessage.textContent = "置いたかたちは、ここで静かに息をしています。";
  } else if (state.diaries.length >= 3) {
    creatureMessage.textContent = "地層が少しずつ、あなたの速さを覚えています。";
  } else {
    creatureMessage.textContent = "まだ言葉にならないものを、ここに置けます。";
  }
}

function renderGallery() {
  galleryList.innerHTML = "";

  if (state.shapes.length === 0) {
    galleryList.append(createEmptyState("まだ保存されたかたちはありません。アトリエでひとつ作れます。"));
    return;
  }

  state.shapes.forEach((shape, index) => {
    const card = document.createElement("article");
    card.className = "art-card";
    card.innerHTML = `
      <div class="art-frame">${renderShapeSvg(shape, "card")}</div>
      <div class="caption">
        <p class="art-plaque">展示 ${String(index + 1).padStart(2, "0")} / ${escapeHtml(labels.shape[getShapeKind(shape)] || getShapeKind(shape))} / ${formatDate(shape.createdAt)}</p>
        <h3>${escapeHtml(shape.title)}</h3>
        <p class="caption-note">${escapeHtml(shape.memo ? excerpt(shape.memo) : "短いメモはありません。")}</p>
        ${renderGalleryCaptionExtra(shape)}
        <span>${isShapePlaced(shape) ? "風景にも置いています" : "美術館に静かに保存中"}</span>
      </div>
      <div class="card-actions">
        <button class="quiet-button toggle-place" type="button" data-shape-id="${escapeHtml(shape.id)}">
          ${isShapePlaced(shape) ? "風景から下ろす" : "風景に置く"}
        </button>
        <button class="quiet-button edit-shape" type="button" data-shape-id="${escapeHtml(shape.id)}">編集</button>
        <button class="quiet-button delete-action delete-shape" type="button" data-shape-id="${escapeHtml(shape.id)}">削除</button>
      </div>
    `;
    galleryList.append(card);
  });

  galleryList.querySelectorAll(".toggle-place").forEach((button) => {
    button.addEventListener("click", () => toggleShapePlacement(button.dataset.shapeId));
  });
  galleryList.querySelectorAll(".edit-shape").forEach((button) => {
    button.addEventListener("click", () => startEditShape(button.dataset.shapeId));
  });
  galleryList.querySelectorAll(".delete-shape").forEach((button) => {
    button.addEventListener("click", () => deleteShape(button.dataset.shapeId));
  });
}

function renderSettings() {
  settingsPlacedList.innerHTML = "";
  const placed = state.shapes.filter((shape) => isShapePlaced(shape));

  if (placed.length === 0) {
    settingsPlacedList.append(createEmptyState("風景に置いているかたちはありません。"));
    return;
  }

  placed.forEach((shape) => {
    const item = document.createElement("article");
    item.className = "settings-shape-item";
    item.innerHTML = `
      <div>
        <h4>${escapeHtml(shape.title)}</h4>
        <p>${escapeHtml(labels.shape[getShapeKind(shape)] || getShapeKind(shape))} / ${escapeHtml(shape.memo || "短いメモはありません。")}</p>
      </div>
      <button class="quiet-button settings-toggle-place" type="button" data-shape-id="${escapeHtml(shape.id)}">風景から下ろす</button>
    `;
    settingsPlacedList.append(item);
  });

  settingsPlacedList.querySelectorAll(".settings-toggle-place").forEach((button) => {
    button.addEventListener("click", () => toggleShapePlacement(button.dataset.shapeId));
  });
}

function renderStrata() {
  strataList.innerHTML = "";

  if (state.diaries.length === 0) {
    strataList.append(createEmptyState("まだ地層はありません。図書館で最初の記録を置けます。"));
    return;
  }

  state.diaries.forEach((diary) => {
    const layer = document.createElement("article");
    layer.className = `strata-item layer-${diary.recordType}`;
    if (diary.important) {
      layer.classList.add("layer-starred");
    }

    layer.innerHTML = `
      <div class="strata-date">${escapeHtml(formatDate(diary.createdAt))}</div>
      <div class="strata-content">
        <h3>${escapeHtml(diary.title)}</h3>
        <p class="strata-meta">
          ${escapeHtml(labels.recordType[diary.recordType] || diary.recordType)} / ${escapeHtml(labels.weather[diary.weather] || diary.weather)} / ${escapeHtml(labels.wave[diary.wave] || diary.wave)}
          ${diary.important ? " / 星にした記録" : ""}
        </p>
        ${renderDiaryExcerpt(diary)}
        <div class="strata-actions">
          <button class="quiet-button edit-diary" type="button" data-diary-id="${escapeHtml(diary.id)}">編集</button>
          <button class="quiet-button delete-action delete-diary" type="button" data-diary-id="${escapeHtml(diary.id)}">削除</button>
        </div>
      </div>
    `;
    strataList.append(layer);
  });

  strataList.querySelectorAll(".edit-diary").forEach((button) => {
    button.addEventListener("click", () => startEditDiary(button.dataset.diaryId));
  });
  strataList.querySelectorAll(".delete-diary").forEach((button) => {
    button.addEventListener("click", () => deleteDiary(button.dataset.diaryId));
  });
}

function syncDiaryBodyFields() {
  const isBoth = diaryRecordTypeSelect.value === "both";
  diaryBodySingle.hidden = isBoth;
  diaryBothFields.hidden = !isBoth;
  diaryBodyInput.required = !isBoth;
}

function startEditDiary(diaryId) {
  const diary = state.diaries.find((item) => item.id === diaryId);
  if (!diary) {
    return;
  }

  editingDiaryId = diary.id;
  diaryForm.reset();
  diaryForm.querySelector('[name="title"]').value = diary.title || "";
  diaryRecordTypeSelect.value = diary.recordType || "inner";
  syncDiaryBodyFields();
  diaryBodyInput.value = diary.body || diaryBodyText(diary);
  diaryInnerBodyInput.value = diary.innerBody || (diary.recordType === "both" ? diary.body || "" : "");
  diaryOuterBodyInput.value = diary.outerBody || "";
  diaryForm.querySelector('[name="weather"]').value = diary.weather || "clear";
  diaryForm.querySelector('[name="wave"]').value = diary.wave || "calm";
  diaryForm.querySelector('[name="important"]').checked = Boolean(diary.important);
  diarySubmitButton.textContent = "記録を更新する";
  showView("library");
  showMessage(diaryStatus, "この記録を編集できます。");
}

function deleteDiary(diaryId) {
  const diary = state.diaries.find((item) => item.id === diaryId);
  if (!diary) {
    return;
  }

  const ok = window.confirm("この記録を削除しますか。ブラウザ内の保存から消えます。");
  if (!ok) {
    return;
  }

  state.diaries = state.diaries.filter((item) => item.id !== diaryId);
  if (editingDiaryId === diaryId) {
    editingDiaryId = null;
    diarySubmitButton.textContent = "記録を地層に積む";
    diaryForm.reset();
    syncDiaryBodyFields();
  }
  syncLandscapeFromLatestDiary();
  saveState();
  renderAll();
}

function startEditShape(shapeId) {
  const shape = state.shapes.find((item) => item.id === shapeId);
  if (!shape) {
    return;
  }

  editingShapeId = shape.id;
  shapeForm.reset();
  const kind = getShapeKind(shape);
  selectShapeKind(kind);
  shapeForm.querySelector('[name="title"]').value = shape.title || "";
  shapeForm.querySelector('[name="memo"]').value = shape.memo || "";
  shapeForm.querySelector('[name="placeInLandscape"]').checked = isShapePlaced(shape);

  if (kind === "circle") {
    const circle = normalizeCircle(shape.circle);
    shapeForm.querySelector('[name="circleHasCore"]').checked = Boolean(circle.hasCore);
    shapeForm.querySelector('[name="circleCore"]').value = circle.core || "";
    ["circleInner1", "circleInner2", "circleInner3"].forEach((name, index) => {
      shapeForm.querySelector(`[name="${name}"]`).value = circle.inner[index] || "";
    });
    ["circleOuter1", "circleOuter2", "circleOuter3"].forEach((name, index) => {
      shapeForm.querySelector(`[name="${name}"]`).value = circle.outer[index] || "";
    });
  } else if (kind === "venn") {
    const venn = normalizeVenn(shape);
    shapeForm.querySelector('[name="vennLeftLabel"]').value = venn.leftLabel;
    shapeForm.querySelector('[name="vennRightLabel"]').value = venn.rightLabel;
    ["vennLeftOnly1", "vennLeftOnly2", "vennLeftOnly3"].forEach((name, index) => {
      shapeForm.querySelector(`[name="${name}"]`).value = venn.leftOnlyTexts[index] || "";
    });
    ["vennOverlap1", "vennOverlap2", "vennOverlap3"].forEach((name, index) => {
      shapeForm.querySelector(`[name="${name}"]`).value = venn.overlapTexts[index] || "";
    });
    ["vennRightOnly1", "vennRightOnly2", "vennRightOnly3"].forEach((name, index) => {
      shapeForm.querySelector(`[name="${name}"]`).value = venn.rightOnlyTexts[index] || "";
    });
    shapeForm.querySelector('[name="vennOutside"]').value = venn.outsideText;
    shapeForm.querySelector('[name="vennLeftSize"]').value = venn.leftCircleSize;
    shapeForm.querySelector('[name="vennRightSize"]').value = venn.rightCircleSize;
    shapeForm.querySelector('[name="vennOverlapAmount"]').value = venn.overlapAmount;
  } else {
    const points = shape.points || {};
    const arrows = normalizeTriangleArrows(shape);
    shapeForm.querySelector('[name="pointA"]').value = points.a || "自分";
    shapeForm.querySelector('[name="pointB"]').value = points.b || "推し";
    shapeForm.querySelector('[name="pointC"]').value = points.c || "";
    shapeForm.querySelector('[name="arrowAB"]').value = arrows.ab;
    shapeForm.querySelector('[name="arrowBA"]').value = arrows.ba;
    shapeForm.querySelector('[name="arrowAC"]').value = arrows.ac;
    shapeForm.querySelector('[name="arrowCA"]').value = arrows.ca;
    shapeForm.querySelector('[name="arrowBC"]').value = arrows.bc;
    shapeForm.querySelector('[name="arrowCB"]').value = arrows.cb;
  }

  shapeSubmitButton.textContent = "かたちを更新する";
  updateShapePreview();
  showView("atelier");
  showMessage(shapeStatus, "このかたちを編集できます。");
}

function deleteShape(shapeId) {
  const shape = state.shapes.find((item) => item.id === shapeId);
  if (!shape) {
    return;
  }

  const ok = window.confirm("このかたちを削除しますか。美術館と風景から消えます。");
  if (!ok) {
    return;
  }

  state.shapes = state.shapes.filter((item) => item.id !== shapeId);
  if (editingShapeId === shapeId) {
    editingShapeId = null;
    shapeSubmitButton.textContent = "かたちを保存する";
    shapeForm.reset();
    selectShapeKind("triangle");
    updateShapePreview();
  }
  saveState();
  renderAll();
}

function toggleShapePlacement(shapeId) {
  const shape = state.shapes.find((item) => item.id === shapeId);
  if (!shape) {
    return;
  }
  const nextPlaced = !isShapePlaced(shape);
  shape.placeInLandscape = nextPlaced;
  shape.placedInLandscape = nextPlaced;
  saveState();
  renderAll();
}

function syncLandscapeFromLatestDiary() {
  const latestDiary = state.diaries[0];
  state.weather = latestDiary?.weather || "clear";
  state.wave = latestDiary?.wave || "calm";
}

function updateShapePreview() {
  const formData = new FormData(shapeForm);
  const kind = formData.get("kind") || "triangle";
  const shape = {
    kind,
    title: getFormText(formData, "title") || "図形のプレビュー",
    memo: getFormText(formData, "memo"),
  };

  if (kind === "triangle") {
    shape.points = {
      a: getFormText(formData, "pointA") || "自分",
      b: getFormText(formData, "pointB") || "推し",
      c: getFormText(formData, "pointC") || "第三者",
    };
    shape.arrows = getTriangleArrows(formData);
  } else if (kind === "circle") {
    shape.circle = {
      hasCore: formData.get("circleHasCore") === "on",
      core: getFormText(formData, "circleCore"),
      inner: getTextList(formData, ["circleInner1", "circleInner2", "circleInner3"]),
      outer: getTextList(formData, ["circleOuter1", "circleOuter2", "circleOuter3"]),
    };
  } else if (kind === "venn") {
    Object.assign(shape, getVennFields(formData));
  }

  shapePreview.innerHTML = renderShapeSvg(shape, "large");
}

function renderAtelierQuestion() {
  const kind = shapeKindInput.value || "triangle";
  const questions = atelierQuestions[kind] || atelierQuestions.triangle;
  const daySeed = Math.floor(Date.now() / 86400000);
  const question = questions[daySeed % questions.length];

  if (!atelierQuestion) {
    return;
  }

  atelierQuestion.querySelector("span").textContent = question;
}

function playShapeSaveEffect() {
  if (!shapeSaveEffect) {
    return;
  }

  shapeSaveEffect.innerHTML = "";
  shapeSaveEffect.classList.remove("active");

  Array.from({ length: 9 }).forEach((_, index) => {
    const piece = document.createElement("span");
    piece.style.setProperty("--x", `${-46 + index * 12}px`);
    piece.style.setProperty("--y", `${index % 2 === 0 ? -34 : -22}px`);
    piece.style.setProperty("--delay", `${index * 45}ms`);
    piece.className = index % 3 === 0 ? "paper-piece" : "light-piece";
    shapeSaveEffect.append(piece);
  });

  requestAnimationFrame(() => {
    shapeSaveEffect.classList.add("active");
  });

  window.setTimeout(() => {
    shapeSaveEffect.classList.remove("active");
    shapeSaveEffect.innerHTML = "";
  }, 1300);
}

function renderShapeSvg(shape, size) {
  const kind = getShapeKind(shape);
  if (kind === "venn") {
    return renderVennSvg(shape, size);
  }
  if (kind === "circle") {
    return renderCircleSvg(shape, size);
  }
  return renderTriangleSvg(shape, size);
}

function renderTriangleSvg(shape, size) {
  const points = shape.points || { a: "自分", b: "推し", c: "第三者" };
  const arrows = normalizeTriangleArrows(shape);
  const title = escapeHtml(shape.title || "三角形");
  const labelSize = size === "mini" ? 11 : 12;
  const arrowTextSize = size === "mini" ? 0 : 10;
  const titleSize = size === "mini" ? 0 : 12;
  const markerId = `arrow-${size}-${toSvgId(shape.id || shape.title || "triangle")}`;
  const arrowTexts =
    size === "mini"
      ? ""
      : `
      <text class="shape-arrow-text arrow-clockwise" x="88" y="132" text-anchor="middle" font-size="${arrowTextSize}">${escapeHtml(shortText(arrows.ab, "", 7))}</text>
      <text class="shape-arrow-text arrow-counter" x="92" y="86" text-anchor="middle" font-size="${arrowTextSize}">${escapeHtml(shortText(arrows.ba, "", 7))}</text>
      <text class="shape-arrow-text arrow-counter" x="112" y="160" text-anchor="middle" font-size="${arrowTextSize}">${escapeHtml(shortText(arrows.ac, "", 7))}</text>
      <text class="shape-arrow-text arrow-clockwise" x="188" y="204" text-anchor="middle" font-size="${arrowTextSize}">${escapeHtml(shortText(arrows.ca, "", 7))}</text>
      <text class="shape-arrow-text arrow-clockwise" x="212" y="132" text-anchor="middle" font-size="${arrowTextSize}">${escapeHtml(shortText(arrows.bc, "", 7))}</text>
      <text class="shape-arrow-text arrow-counter" x="208" y="86" text-anchor="middle" font-size="${arrowTextSize}">${escapeHtml(shortText(arrows.cb, "", 7))}</text>
    `;

  return `
    <svg viewBox="0 0 300 240" role="img" aria-label="${title}">
      <defs>
        <marker id="${markerId}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z"></path>
        </marker>
      </defs>
      <path class="shape-fill" d="M150 34 L54 178 L246 178 Z"></path>
      <path class="shape-line strong" d="M62 166 L140 50" marker-end="url(#${markerId})"></path>
      <path class="shape-line" d="M134 47 L58 160" marker-end="url(#${markerId})"></path>
      <path class="shape-line" d="M70 168 L226 168" marker-end="url(#${markerId})"></path>
      <path class="shape-line strong" d="M230 188 L70 188" marker-end="url(#${markerId})"></path>
      <path class="shape-line strong" d="M160 50 L238 166" marker-end="url(#${markerId})"></path>
      <path class="shape-line" d="M242 160 L166 47" marker-end="url(#${markerId})"></path>
      <circle class="shape-point" cx="150" cy="34" r="6"></circle>
      <circle class="shape-point" cx="54" cy="178" r="6"></circle>
      <circle class="shape-point" cx="246" cy="178" r="6"></circle>
      ${arrowTexts}
      ${titleSize ? `<text class="shape-title" x="150" y="228" text-anchor="middle" font-size="${titleSize}">${title}</text>` : ""}
      <text x="150" y="23" text-anchor="middle" font-size="${labelSize}">${escapeHtml(shortText(points.b, "推し", 10))}</text>
      <text x="52" y="211" text-anchor="middle" font-size="${labelSize}">${escapeHtml(shortText(points.a, "自分", 10))}</text>
      <text x="248" y="211" text-anchor="middle" font-size="${labelSize}">${escapeHtml(shortText(points.c, "第三者", 10))}</text>
    </svg>
  `;
}

function renderCircleSvg(shape, size) {
  const circle = normalizeCircle(shape.circle);
  const title = escapeHtml(shape.title || "円");
  const labelSize = size === "mini" ? 10 : 10.5;
  const titleSize = size === "mini" ? 0 : 12;
  const textLimit = size === "mini" ? 1 : 3;
  const innerCoords = circle.hasCore
    ? [
        [150, 72],
        [72, 128],
        [228, 128],
      ]
    : [
        [150, 76],
        [150, 120],
        [150, 164],
      ];
  const outerCoords = [
    [150, 24],
    [56, 196],
    [244, 196],
  ];
  const innerTexts = circle.inner
    .slice(0, textLimit)
    .map((text, index) => {
      const [x, y] = innerCoords[index];
      return renderSvgMultilineText({
        x,
        y,
        text,
        fallback: `内側${index + 1}`,
        maxCharsPerLine: 5,
        maxLines: 2,
        fontSize: labelSize,
        className: "circle-label",
      });
    })
    .join("");
  const outerTexts = circle.outer
    .slice(0, textLimit)
    .map((text, index) => {
      const [x, y] = outerCoords[index];
      return renderSvgMultilineText({
        x,
        y,
        text,
        fallback: `外側${index + 1}`,
        maxCharsPerLine: 5,
        maxLines: 2,
        fontSize: labelSize,
        className: "circle-label circle-outer-label",
      });
    })
    .join("");
  const core = circle.hasCore
    ? `
      <circle class="shape-core" cx="150" cy="116" r="26"></circle>
      ${renderSvgMultilineText({
        x: 150,
        y: 116,
        text: circle.core,
        fallback: "中心",
        maxCharsPerLine: 3,
        maxLines: 2,
        fontSize: 10,
        className: "circle-label circle-core-label",
        lineHeight: 11,
      })}
    `
    : "";

  return `
    <svg viewBox="0 0 300 240" role="img" aria-label="${title}">
      <circle class="shape-fill circle-outer" cx="150" cy="116" r="92"></circle>
      <circle class="shape-ring" cx="150" cy="116" r="92"></circle>
      <circle class="shape-ring dashed" cx="150" cy="116" r="58"></circle>
      ${core}
      ${innerTexts}
      ${outerTexts}
      ${titleSize ? `<text class="shape-title" x="150" y="228" text-anchor="middle" font-size="${titleSize}">${title}</text>` : ""}
    </svg>
  `;
}

function renderVennSvg(shape, size) {
  const venn = normalizeVenn(shape);
  const title = escapeHtml(shape.title || "ベン図");
  const isMini = size === "mini";
  const labelSize = isMini ? 10 : 12;
  const regionSize = isMini ? 0 : 11;
  const titleSize = isMini ? 0 : 12;
  const leftRadius = isMini ? 36 : venn.leftCircleSize;
  const rightRadius = isMini ? 36 : venn.rightCircleSize;
  const maxDistance = leftRadius + rightRadius - 14;
  const minDistance = Math.max(leftRadius, rightRadius) * 0.52;
  const distance = maxDistance - (venn.overlapAmount / 100) * (maxDistance - minDistance);
  const leftCx = 160 - distance / 2;
  const rightCx = 160 + distance / 2;
  const cy = isMini ? 106 : 112;
  const outerText = shortText(venn.outsideText, "外側", 12);

  if (isMini) {
    return `
      <svg class="venn-svg" viewBox="0 0 320 220" role="img" aria-label="${title}">
        <circle class="venn-circle venn-left" cx="${leftCx}" cy="${cy}" r="${leftRadius}"></circle>
        <circle class="venn-circle venn-right" cx="${rightCx}" cy="${cy}" r="${rightRadius}"></circle>
      </svg>
    `;
  }

  return `
    <svg class="venn-svg" viewBox="0 0 320 250" role="img" aria-label="${title}">
      <rect class="venn-outside" x="22" y="28" width="276" height="178" rx="18"></rect>
      <circle class="venn-circle venn-left" cx="${leftCx}" cy="${cy}" r="${leftRadius}"></circle>
      <circle class="venn-circle venn-right" cx="${rightCx}" cy="${cy}" r="${rightRadius}"></circle>
      <text x="${leftCx}" y="${Math.max(28, cy - leftRadius - 8)}" text-anchor="middle" font-size="${labelSize}">${escapeHtml(shortText(venn.leftLabel, "自分", 10))}</text>
      <text x="${rightCx}" y="${Math.max(28, cy - rightRadius - 8)}" text-anchor="middle" font-size="${labelSize}">${escapeHtml(shortText(venn.rightLabel, "相手", 10))}</text>
      ${renderVennRegionTexts(venn.leftOnlyTexts, leftCx - leftRadius * 0.34, cy, "左だけ", "venn-region-text", 7)}
      ${renderVennRegionTexts(venn.overlapTexts, 160, cy, "重なり", "venn-region-text venn-overlap-text", 5)}
      ${renderVennRegionTexts(venn.rightOnlyTexts, rightCx + rightRadius * 0.34, cy, "右だけ", "venn-region-text", 7)}
      <text class="venn-outside-text" x="160" y="198" text-anchor="middle" font-size="${regionSize}">${escapeHtml(outerText)}</text>
      ${titleSize ? `<text class="shape-title" x="160" y="235" text-anchor="middle" font-size="${titleSize}">${title}</text>` : ""}
    </svg>
  `;
}

function renderDiaryExcerpt(diary) {
  if (diary.recordType === "both") {
    const inner = diary.innerBody ? excerpt(diary.innerBody) : "";
    const outer = diary.outerBody ? excerpt(diary.outerBody) : "";
    if (inner || outer) {
      return `
        <div class="diary-split-excerpt">
          <p><strong>内側</strong>${escapeHtml(inner || "まだ書かれていません。")}</p>
          <p><strong>外側</strong>${escapeHtml(outer || "まだ書かれていません。")}</p>
        </div>
      `;
    }
  }
  return `<p>${escapeHtml(excerpt(diaryBodyText(diary)))}</p>`;
}

function diaryBodyText(diary) {
  if (diary.body) {
    return diary.body;
  }
  return [diary.innerBody, diary.outerBody].filter(Boolean).join(" / ");
}

function renderGalleryCaptionExtra(shape) {
  if (getShapeKind(shape) !== "venn") {
    return "";
  }

  const venn = normalizeVenn(shape);
  return `
    <p class="caption-meta">左: ${escapeHtml(shortText(venn.leftLabel, "自分", 10))} / 右: ${escapeHtml(shortText(venn.rightLabel, "相手", 10))}</p>
    <p class="caption-meta">重なり: ${escapeHtml(shortText(venn.overlapTexts.join(" / "), "まだ置かれていません", 24))}</p>
  `;
}

function createEmptyState(text) {
  const empty = document.createElement("p");
  empty.className = "empty-state";
  empty.textContent = text;
  return empty;
}

function getFormText(formData, name) {
  return String(formData.get(name) || "").trim();
}

function getTextList(formData, names) {
  return names.map((name) => getFormText(formData, name)).filter(Boolean).slice(0, 3);
}

function getTriangleArrows(formData) {
  return {
    ab: getFormText(formData, "arrowAB"),
    ba: getFormText(formData, "arrowBA"),
    ac: getFormText(formData, "arrowAC"),
    ca: getFormText(formData, "arrowCA"),
    bc: getFormText(formData, "arrowBC"),
    cb: getFormText(formData, "arrowCB"),
  };
}

function getVennFields(formData) {
  const leftOnlyTexts = getTextList(formData, ["vennLeftOnly1", "vennLeftOnly2", "vennLeftOnly3"]);
  const overlapTexts = getTextList(formData, ["vennOverlap1", "vennOverlap2", "vennOverlap3"]);
  const rightOnlyTexts = getTextList(formData, ["vennRightOnly1", "vennRightOnly2", "vennRightOnly3"]);

  return {
    leftLabel: getFormText(formData, "vennLeftLabel") || "自分",
    rightLabel: getFormText(formData, "vennRightLabel") || "相手",
    leftOnlyText: leftOnlyTexts[0] || "",
    overlapText: overlapTexts[0] || "",
    rightOnlyText: rightOnlyTexts[0] || "",
    leftOnlyTexts,
    overlapTexts,
    rightOnlyTexts,
    outsideText: getFormText(formData, "vennOutside"),
    leftCircleSize: clampNumber(formData.get("vennLeftSize"), 70, 112, 92),
    rightCircleSize: clampNumber(formData.get("vennRightSize"), 70, 112, 92),
    overlapAmount: clampNumber(formData.get("vennOverlapAmount"), 18, 82, 52),
  };
}

function normalizeTriangleArrows(shape) {
  return {
    ab: shape.arrows?.ab || "",
    ba: shape.arrows?.ba || "",
    ac: shape.arrows?.ac || "",
    ca: shape.arrows?.ca || "",
    bc: shape.arrows?.bc || "",
    cb: shape.arrows?.cb || "",
  };
}

function normalizeVenn(shape = {}) {
  const leftOnlyTexts = normalizeTextList(shape.leftOnlyTexts, shape.leftOnlyText);
  const overlapTexts = normalizeTextList(shape.overlapTexts, shape.overlapText);
  const rightOnlyTexts = normalizeTextList(shape.rightOnlyTexts, shape.rightOnlyText);

  return {
    leftLabel: shape.leftLabel || "自分",
    rightLabel: shape.rightLabel || "相手",
    leftOnlyText: leftOnlyTexts[0] || "",
    overlapText: overlapTexts[0] || "",
    rightOnlyText: rightOnlyTexts[0] || "",
    leftOnlyTexts,
    overlapTexts,
    rightOnlyTexts,
    outsideText: shape.outsideText || "",
    leftCircleSize: clampNumber(shape.leftCircleSize, 70, 112, 92),
    rightCircleSize: clampNumber(shape.rightCircleSize, 70, 112, 92),
    overlapAmount: clampNumber(shape.overlapAmount, 18, 82, 52),
  };
}

function renderSvgMultilineText({
  x,
  y,
  text,
  fallback = "",
  maxCharsPerLine = 6,
  maxLines = 2,
  fontSize = 11,
  className = "",
  lineHeight = 12,
}) {
  const lines = splitSvgText(text || fallback, maxCharsPerLine, maxLines);
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  const classAttribute = className ? ` class="${className}"` : "";
  const tspans = lines
    .map((line, index) => {
      const yAttribute = index === 0 ? ` y="${startY}"` : ` dy="${lineHeight}"`;
      return `<tspan x="${x}"${yAttribute}>${escapeHtml(line)}</tspan>`;
    })
    .join("");

  return `<text${classAttribute} text-anchor="middle" font-size="${fontSize}">${tspans}</text>`;
}

function renderVennRegionTexts(texts, x, y, fallback, className, maxCharsPerLine) {
  const visibleTexts = texts.length > 0 ? texts.slice(0, 3) : [fallback];
  const lineHeight = 13;
  const startY = y - ((visibleTexts.length - 1) * lineHeight) / 2;
  const tspans = visibleTexts
    .map((text, index) => {
      const line = shortText(text, fallback, maxCharsPerLine);
      const yAttribute = index === 0 ? ` y="${startY}"` : ` dy="${lineHeight}"`;
      return `<tspan x="${x}"${yAttribute}>${escapeHtml(line)}</tspan>`;
    })
    .join("");

  return `<text class="${className}" text-anchor="middle" font-size="10.5">${tspans}</text>`;
}

function splitSvgText(value, maxCharsPerLine, maxLines) {
  const chars = Array.from(String(value || "").trim());
  if (chars.length === 0) {
    return [""];
  }

  const capacity = maxCharsPerLine * maxLines;
  const limited =
    chars.length > capacity ? [...chars.slice(0, Math.max(1, capacity - 1)), "…"] : chars;
  const lines = [];

  for (let index = 0; index < limited.length && lines.length < maxLines; index += maxCharsPerLine) {
    lines.push(limited.slice(index, index + maxCharsPerLine).join(""));
  }

  return lines;
}

function normalizeTextList(value, fallback = "") {
  const list = Array.isArray(value) ? value : [];
  const normalized = list.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 3);
  const fallbackText = String(fallback || "").trim();

  if (normalized.length > 0) {
    return normalized;
  }

  return fallbackText ? [fallbackText] : [];
}

function normalizeCircle(circle = {}) {
  const legacyInner = typeof circle.inner === "string" ? [circle.inner] : circle.inner;
  const legacyOuter = typeof circle.outer === "string" ? [circle.outer] : circle.outer;
  const inner = Array.isArray(legacyInner) ? legacyInner.filter(Boolean).slice(0, 3) : [];
  const outer = Array.isArray(legacyOuter) ? legacyOuter.filter(Boolean).slice(0, 3) : [];
  const hasCore = circle.hasCore === undefined ? Boolean(circle.core) : Boolean(circle.hasCore);
  return {
    hasCore,
    core: circle.core || "",
    inner: inner.length > 0 ? inner : ["内側"],
    outer: outer.length > 0 ? outer : ["外側"],
  };
}

function isShapePlaced(shape) {
  return Boolean(shape.placeInLandscape || shape.placedInLandscape);
}

function getShapeKind(shape) {
  return shape.kind || shape.type || "triangle";
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, number));
}

function shortText(value, fallback = "", maxLength = 12) {
  const text = String(value || fallback || "").trim();
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 1)}…`;
}

function toSvgId(value) {
  const code = Array.from(String(value || "shape")).reduce(
    (total, char) => total + char.charCodeAt(0),
    0
  );
  return `shape-${code}`;
}

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function excerpt(text) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  if (normalized.length <= 88) {
    return normalized;
  }
  return `${normalized.slice(0, 88)}...`;
}

function showMessage(element, text) {
  element.textContent = text;
  window.setTimeout(() => {
    if (element.textContent === text) {
      element.textContent = "";
    }
  }, 5000);
}

function seededPosition(id, index) {
  const seed = Array.from(String(id || "item")).reduce(
    (total, char) => total + char.charCodeAt(0),
    index * 17
  );
  return {
    left: 12 + (seed * 13) % 76,
    top: 14 + (seed * 7) % 46,
    size: 3 + (seed % 4),
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
