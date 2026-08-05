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
const creatureMessage = document.querySelector("#creature-message");
const diaryForm = document.querySelector("#diary-form");
const diaryStatus = document.querySelector("#diary-status");
const diarySubmitButton = diaryForm.querySelector('button[type="submit"]');
const diaryRecordTypeSelect = diaryForm.querySelector('[name="recordType"]');
const diaryBodySingle = diaryForm.querySelector('[data-body-mode="single"]');
const diaryBodyInput = diaryForm.querySelector('[name="body"]');
const diaryInnerBodyInput = diaryForm.querySelector('[name="innerBody"]');
const diaryOuterBodyInput = diaryForm.querySelector('[name="outerBody"]');
const diaryInnerLabelInput = diaryForm.querySelector('[name="innerLabel"]');
const diaryOuterLabelInput = diaryForm.querySelector('[name="outerLabel"]');
const diaryMarginLabelInput = diaryForm.querySelector('[name="marginLabel"]');
const recordShapePreview = document.querySelector("#record-shape-preview");
const recordInnerLabelPreview = document.querySelector("#record-inner-label-preview");
const recordOuterLabelPreview = document.querySelector("#record-outer-label-preview");
const recordMarginLabelPreview = document.querySelector("#record-margin-label-preview");
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
const shapeSheet = document.querySelector("#shape-edit-sheet");
const shapeSheetBackdrop = document.querySelector("#shape-sheet-backdrop");
const shapeSheetTitle = document.querySelector("#shape-sheet-title");
const shapeSheetDescription = document.querySelector("#shape-sheet-description");
const shapeSheetFields = document.querySelector("#shape-sheet-fields");
const shapeSheetApply = document.querySelector("#shape-sheet-apply");
const shapeSheetClose = document.querySelector("#shape-sheet-close");
const galleryList = document.querySelector("#gallery-list");
const strataList = document.querySelector("#strata-list");
const resetDataButton = document.querySelector("#reset-data-button");
const resetStatus = document.querySelector("#reset-status");
const shapeTabs = document.querySelectorAll(".shape-tab");

const SHAPE_TEXT_MAX_LENGTH = 10;
const SHAPE_TEXT_WRAP_THRESHOLD = 7;
const shapeCellTextFields = new Set([
  "pointA",
  "pointB",
  "pointC",
  "arrowAB",
  "arrowBA",
  "arrowAC",
  "arrowCA",
  "arrowBC",
  "arrowCB",
  "circleCore",
  "circleInner1",
  "circleInner2",
  "circleInner3",
  "circleBoundary1",
  "circleBoundary2",
  "circleBoundary3",
  "circleOuter1",
  "circleOuter2",
  "circleOuter3",
  "vennLeftLabel",
  "vennRightLabel",
  "vennLeftOnly1",
  "vennLeftOnly2",
  "vennLeftOnly3",
  "vennOverlap1",
  "vennOverlap2",
  "vennOverlap3",
  "vennRightOnly1",
  "vennRightOnly2",
  "vennRightOnly3",
  "vennOutside",
]);

const SHAPE_DOWNLOAD_STYLE = `
  svg { background: #fffdf7; font-family: "Yu Gothic", "Hiragino Sans", Meiryo, sans-serif; }
  text { fill: #27323d; paint-order: stroke; stroke: rgba(255, 253, 247, 0.78); stroke-width: 2px; stroke-linejoin: round; }
  .shape-fill { fill: rgba(184, 212, 170, 0.34); stroke: rgba(39, 50, 61, 0.54); stroke-width: 1.6; }
  .shape-line { fill: none; stroke: #4b7394; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
  .shape-line.strong { stroke: #b56b54; }
  marker path { fill: #4b7394; stroke: none; }
  .shape-point, .shape-core { fill: #fffdf7; stroke: #4f7470; stroke-width: 2; }
  .shape-ring { fill: none; stroke: rgba(39, 50, 61, 0.48); stroke-width: 1.6; }
  .shape-ring.dashed { stroke-dasharray: 6 6; }
  .circle-outer { fill: rgba(210, 226, 214, 0.62); }
  .circle-outer-label, .venn-outside-text { fill: #5d6e71; }
  .circle-boundary-label { fill: #675f47; }
  .circle-core-label, .shape-title { font-weight: 700; }
  .venn-outside { fill: rgba(245, 239, 226, 0.7); stroke: rgba(39, 50, 61, 0.14); stroke-width: 1; }
  .venn-circle { fill-opacity: 0.54; stroke: rgba(39, 50, 61, 0.48); stroke-width: 1.8; }
  .venn-left { fill: #b8d4aa; }
  .venn-right { fill: #9fc3d5; }
  .venn-overlap-text { font-weight: 700; }
  .shape-hotspot { display: none; }
`;

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
let activeShapeSheetConfig = null;

bindNavigation();
bindDiaryForm();
bindHomeWeatherForm();
bindQuickWeatherForm();
bindFreeMemoForm();
bindShapeForm();
bindShapeTabs();
bindShapeSheet();
bindGalleryActions();
bindSettingsControls();
applyShapeTextInputLimits();
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
  syncDiaryBodyFields();
  updateRecordShapePreview();
  diaryForm.addEventListener("input", updateRecordShapePreview);
  diaryForm.addEventListener("focusin", (event) => {
    recordShapePreview.dataset.focusArea = diaryFocusArea(event.target);
  });
  diaryForm.addEventListener("focusout", () => {
    recordShapePreview.dataset.focusArea = "";
  });

  diaryForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(diaryForm);
    const body = getFormText(formData, "body");
    const innerBody = getFormText(formData, "innerBody");
    const outerBody = getFormText(formData, "outerBody");
    const recordType = inferRecordType(innerBody, outerBody, body);

    if (!innerBody && !outerBody && !body) {
      showMessage(diaryStatus, "内側・外側・余白のどこかに、少しだけ記録を置いてください。");
      return;
    }

    const existingDiary = state.diaries.find((item) => item.id === editingDiaryId);
    const diary = {
      id: existingDiary?.id || createId(),
      title: getFormText(formData, "title") || "名前のない記録",
      body,
      innerBody,
      outerBody,
      innerLabel: getFormText(formData, "innerLabel") || "内側",
      outerLabel: getFormText(formData, "outerLabel") || "外側",
      marginLabel: getFormText(formData, "marginLabel") || "余白",
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
    updateRecordShapePreview();
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
  shapeForm.addEventListener("input", (event) => {
    clampShapeCellInput(event.target);
    updateShapePreview();
  });

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
        boundary: getTextList(formData, ["circleBoundary1", "circleBoundary2", "circleBoundary3"]),
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

    const message = existingShape ? "かたちを更新しました。" : "かたちを保存しました。";
    showMessage(shapeStatus, message);
  });
}

function applyShapeTextInputLimits() {
  shapeCellTextFields.forEach((name) => {
    shapeForm.querySelectorAll(`[name="${name}"]`).forEach((input) => {
      input.maxLength = SHAPE_TEXT_MAX_LENGTH;
      clampShapeCellInput(input);
    });
  });
}

function clampShapeCellInput(input) {
  if (!input?.name || !shapeCellTextFields.has(input.name)) {
    return;
  }

  const chars = Array.from(input.value || "");
  if (chars.length > SHAPE_TEXT_MAX_LENGTH) {
    input.value = chars.slice(0, SHAPE_TEXT_MAX_LENGTH).join("");
  }
}

function bindShapeTabs() {
  shapeTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      selectShapeKind(tab.dataset.shapeKind);
      updateShapePreview();
      closeShapeSheet();
    });
  });
}

function bindShapeSheet() {
  shapePreview.addEventListener("click", (event) => {
    const target = event.target.closest("[data-shape-edit]");
    if (!target) {
      return;
    }
    openShapeSheet(target.dataset.shapeEdit);
  });

  shapePreview.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    const target = event.target.closest("[data-shape-edit]");
    if (!target) {
      return;
    }
    event.preventDefault();
    openShapeSheet(target.dataset.shapeEdit);
  });

  shapeForm.querySelectorAll("[data-mobile-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      openShapeSheet(button.dataset.mobileEdit);
    });
  });

  shapeSheetApply.addEventListener("click", applyShapeSheet);
  shapeSheetClose.addEventListener("click", closeShapeSheet);
  shapeSheetBackdrop.addEventListener("click", closeShapeSheet);
  shapeSheetFields.addEventListener("input", syncShapeSheetFields);
  shapeSheetFields.addEventListener("change", syncShapeSheetFields);
}

function bindGalleryActions() {
  galleryList.addEventListener("click", (event) => {
    const memoButton = event.target.closest(".show-shape-memo");
    if (memoButton) {
      event.preventDefault();
      event.stopPropagation();
      toggleShapeMemo(memoButton);
      return;
    }

    const downloadButton = event.target.closest(".download-shape");
    if (downloadButton) {
      event.preventDefault();
      event.stopPropagation();
      downloadShapeImage(downloadButton.dataset.shapeId, downloadButton);
      return;
    }

    const deleteButton = event.target.closest(".delete-shape");
    if (deleteButton) {
      event.preventDefault();
      event.stopPropagation();
      deleteShape(deleteButton.dataset.shapeId);
      return;
    }

    const editButton = event.target.closest(".edit-shape");
    if (editButton) {
      event.preventDefault();
      event.stopPropagation();
      startEditShape(editButton.dataset.shapeId);
    }
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
    updateRecordShapePreview();
    selectShapeKind("triangle");
    renderAll();
    updateShapePreview();
    showMessage(resetStatus, "保存データをリセットしました。");
  });
}

function openShapeSheet(part) {
  const config = getShapeSheetConfig(part);
  if (!config) {
    return;
  }

  activeShapeSheetConfig = config;
  shapeSheetTitle.textContent = config.title;
  shapeSheetDescription.textContent = config.description;
  shapeSheetFields.innerHTML = config.fields.map(renderShapeSheetField).join("");
  shapeSheet.hidden = false;
  shapeSheetBackdrop.hidden = false;
  document.body.classList.add("sheet-open");

  const firstInput = shapeSheetFields.querySelector("input, textarea");
  if (firstInput) {
    window.setTimeout(() => firstInput.focus(), 80);
  }
}

function closeShapeSheet() {
  activeShapeSheetConfig = null;
  shapeSheet.hidden = true;
  shapeSheetBackdrop.hidden = true;
  shapeSheetFields.innerHTML = "";
  document.body.classList.remove("sheet-open");
}

function applyShapeSheet() {
  syncShapeSheetFields();
  closeShapeSheet();
}

function syncShapeSheetFields() {
  if (!activeShapeSheetConfig) {
    return;
  }

  activeShapeSheetConfig.fields.forEach((field) => {
    const sheetInput = shapeSheetFields.querySelector(`[name="${field.sheetName}"]`);
    const formInput = shapeForm.querySelector(`[name="${field.name}"]`);
    if (!sheetInput || !formInput) {
      return;
    }

    if (formInput.type === "checkbox") {
      formInput.checked = sheetInput.checked;
    } else {
      formInput.value = sheetInput.value;
      clampShapeCellInput(formInput);
      if (shapeCellTextFields.has(field.name)) {
        sheetInput.value = formInput.value;
      }
    }
    formInput.dispatchEvent(new Event("input", { bubbles: true }));
    formInput.dispatchEvent(new Event("change", { bubbles: true }));
  });

  updateShapePreview();
}

function renderShapeSheetField(field) {
  const formInput = shapeForm.querySelector(`[name="${field.name}"]`);
  const value = formInput?.type === "checkbox" ? Boolean(formInput.checked) : formInput?.value || "";

  if (field.type === "textarea") {
    return `
      <label>
        ${escapeHtml(field.label)}
        <textarea name="${field.sheetName}" rows="${field.rows || 5}" placeholder="${escapeHtml(field.placeholder || "")}">${escapeHtml(value)}</textarea>
      </label>
    `;
  }

  if (field.type === "checkbox") {
    return `
      <label class="check-row">
        <input name="${field.sheetName}" type="checkbox" ${value ? "checked" : ""}>
        <span>${escapeHtml(field.label)}</span>
      </label>
    `;
  }

  if (field.type === "range") {
    return `
      <label>
        ${escapeHtml(field.label)}
        <input name="${field.sheetName}" type="range" min="${field.min}" max="${field.max}" value="${escapeHtml(value || field.value || "")}">
      </label>
    `;
  }

  return `
    <label>
      ${escapeHtml(field.label)}
      <input name="${field.sheetName}" type="text" value="${escapeHtml(value)}" placeholder="${escapeHtml(field.placeholder || "")}" maxlength="${field.maxLength || (shapeCellTextFields.has(field.name) ? SHAPE_TEXT_MAX_LENGTH : 40)}">
    </label>
  `;
}

function getShapeSheetConfig(part) {
  const kind = shapeKindInput.value || "triangle";
  const configs = {
    title: {
      title: "図形タイトル",
      description: "このかたちをあとから見つけやすい短い名前にします。",
      fields: [sheetField("title", "図形タイトル", { placeholder: "例：自分・推し・公式の距離" })],
    },
    memo: {
      title: "フリーメモ",
      description: "図形の中に入れきれない長い補足を置けます。",
      fields: [sheetField("memo", "フリーメモ", { type: "textarea", rows: 6 })],
    },
    adjust: {
      title: "調整",
      description: "この図形は固定の形で表示しています。編集したい場所を図形上でタップしてください。",
      fields: [],
    },
  };

  if (kind === "triangle") {
    Object.assign(configs, {
      pointA: trianglePointConfig("頂点A", "pointA"),
      pointB: trianglePointConfig("頂点B", "pointB"),
      pointC: trianglePointConfig("頂点C", "pointC"),
      sideAB: triangleSideConfig("辺AB", "AとBのあいだにある関係を短く置きます。", "arrowAB", "A → B", "arrowBA", "B → A"),
      sideBC: triangleSideConfig("辺BC", "BとCのあいだにある関係を短く置きます。", "arrowBC", "B → C", "arrowCB", "C → B"),
      sideCA: triangleSideConfig("辺CA", "CとAのあいだにある関係を短く置きます。", "arrowCA", "C → A", "arrowAC", "A → C"),
      center: configs.memo,
    });
  } else if (kind === "circle") {
    Object.assign(configs, {
      center: {
        title: "中心",
        description: "核にあるものを短い言葉で置きます。",
        fields: [
          sheetField("circleHasCore", "中心を入れる", { type: "checkbox" }),
          sheetField("circleCore", "中心に置きたいもの", { placeholder: "例：大事にしたい核" }),
        ],
      },
      inner: multiFieldConfig("内側", "内側に置きたいものを、3つまで短く置けます。", [
        ["circleInner1", "内側 1"],
        ["circleInner2", "内側 2"],
        ["circleInner3", "内側 3"],
      ]),
      boundary: multiFieldConfig("境界", "境目に近いものがあれば、短い言葉で置けます。", [
        ["circleBoundary1", "境界 1"],
        ["circleBoundary2", "境界 2"],
        ["circleBoundary3", "境界 3"],
      ]),
      outer: multiFieldConfig("外側", "外側にあるものを、3つまで短く置けます。", [
        ["circleOuter1", "外側 1"],
        ["circleOuter2", "外側 2"],
        ["circleOuter3", "外側 3"],
      ]),
      adjust: {
        title: "調整",
        description: "円は現在、固定の大きさで表示しています。中心の有無だけ調整できます。",
        fields: [sheetField("circleHasCore", "中心を入れる", { type: "checkbox" })],
      },
    });
  } else if (kind === "venn") {
    Object.assign(configs, {
      leftLabel: {
        title: "左円ラベル",
        description: "左の円が表しているものを短く書きます。",
        fields: [sheetField("vennLeftLabel", "左の円のラベル", { placeholder: "例：自分" })],
      },
      rightLabel: {
        title: "右円ラベル",
        description: "右の円が表しているものを短く書きます。",
        fields: [sheetField("vennRightLabel", "右の円のラベル", { placeholder: "例：公式、他のファン" })],
      },
      leftOnly: multiFieldConfig("左だけの領域", "左の円にだけ入るものを、3つまで短く置けます。", [
        ["vennLeftOnly1", "左だけ 1"],
        ["vennLeftOnly2", "左だけ 2"],
        ["vennLeftOnly3", "左だけ 3"],
      ]),
      overlap: multiFieldConfig("重なり部分", "両方に共通しているものを置いてください。", [
        ["vennOverlap1", "重なり 1"],
        ["vennOverlap2", "重なり 2"],
        ["vennOverlap3", "重なり 3"],
      ]),
      rightOnly: multiFieldConfig("右だけの領域", "右の円にだけ入るものを、3つまで短く置けます。", [
        ["vennRightOnly1", "右だけ 1"],
        ["vennRightOnly2", "右だけ 2"],
        ["vennRightOnly3", "右だけ 3"],
      ]),
      outside: {
        title: "外側",
        description: "どちらにも入らないけれど、周囲にあるものを置けます。",
        fields: [sheetField("vennOutside", "外側の領域", { placeholder: "例：SNSの空気、世間の反応" })],
      },
      adjust: {
        title: "調整",
        description: "円の大きさと重なり具合を調整できます。",
        fields: [
          sheetField("vennLeftSize", "左の円の大きさ", { type: "range", min: 70, max: 112, value: 92 }),
          sheetField("vennRightSize", "右の円の大きさ", { type: "range", min: 70, max: 112, value: 92 }),
          sheetField("vennOverlapAmount", "重なりの大きさ", { type: "range", min: 18, max: 82, value: 52 }),
        ],
      },
    });
  }

  return configs[part] || null;
}

function sheetField(name, label, options = {}) {
  return {
    name,
    label,
    sheetName: `sheet-${name}`,
    type: options.type || "text",
    placeholder: options.placeholder || "",
    rows: options.rows,
    min: options.min,
    max: options.max,
    value: options.value,
    maxLength: options.maxLength,
  };
}

function trianglePointConfig(title, name) {
  return {
    title,
    description: "頂点のラベルを短く編集します。",
    fields: [sheetField(name, `${title}のラベル`)],
  };
}

function triangleSideConfig(title, description, firstName, firstLabel, secondName, secondLabel) {
  return {
    title,
    description,
    fields: [
      sheetField(firstName, firstLabel, { placeholder: "短い関係メモ" }),
      sheetField(secondName, secondLabel, { placeholder: "短い関係メモ" }),
    ],
  };
}

function multiFieldConfig(title, description, fields) {
  return {
    title,
    description,
    fields: fields.map(([name, label]) => sheetField(name, label, { placeholder: "短い言葉" })),
  };
}

function renderAll() {
  renderHome();
  renderGallery();
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

function renderCreatureMessage() {
  const importantCount = state.diaries.filter((diary) => diary.important).length;
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
        ${renderGalleryCaptionExtra(shape)}
      </div>
      <div class="gallery-memo-panel" hidden>
        <p>${escapeHtml(shape.memo ? excerpt(shape.memo) : "短いメモはありません。")}</p>
      </div>
      <div class="card-actions">
        <button class="quiet-button show-shape-memo" type="button" aria-expanded="false">表示</button>
        <button class="quiet-button edit-shape" type="button" data-shape-id="${escapeHtml(shape.id)}">編集</button>
        <button class="quiet-button download-shape" type="button" data-shape-id="${escapeHtml(shape.id)}">画像保存</button>
        <button class="quiet-button delete-action delete-shape" type="button" data-shape-id="${escapeHtml(shape.id)}">削除</button>
      </div>
    `;
    galleryList.append(card);
  });

}

function toggleShapeMemo(button) {
  const panel = button.closest(".art-card")?.querySelector(".gallery-memo-panel");
  if (!panel) {
    return;
  }

  const shouldOpen = panel.hidden;
  panel.hidden = !shouldOpen;
  button.setAttribute("aria-expanded", String(shouldOpen));
  button.textContent = shouldOpen ? "閉じる" : "表示";
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
      ${renderRecordShapeMini(diary)}
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
  diaryRecordTypeSelect.value = "both";
  diaryBodyInput.required = false;
  diaryInnerBodyInput.required = false;
  diaryOuterBodyInput.required = false;
}

function inferRecordType(innerBody, outerBody, marginBody) {
  if (innerBody && !outerBody && !marginBody) {
    return "inner";
  }
  if (outerBody && !innerBody && !marginBody) {
    return "outer";
  }
  return "both";
}

function diaryFocusArea(input) {
  if (!input?.name) {
    return "";
  }
  if (input.name === "innerBody" || input.name === "innerLabel") {
    return "inner";
  }
  if (input.name === "outerBody" || input.name === "outerLabel") {
    return "outer";
  }
  if (input.name === "body" || input.name === "marginLabel") {
    return "margin";
  }
  return "";
}

function updateRecordShapePreview() {
  recordInnerLabelPreview.textContent = shortText(diaryInnerLabelInput.value, "内側", 10);
  recordOuterLabelPreview.textContent = shortText(diaryOuterLabelInput.value, "外側", 10);
  recordMarginLabelPreview.textContent = shortText(diaryMarginLabelInput.value, "余白", 10);
  recordShapePreview.classList.toggle("has-inner", Boolean(diaryInnerBodyInput.value.trim()));
  recordShapePreview.classList.toggle("has-outer", Boolean(diaryOuterBodyInput.value.trim()));
  recordShapePreview.classList.toggle("has-margin", Boolean(diaryBodyInput.value.trim()));
}

function startEditDiary(diaryId) {
  const diary = state.diaries.find((item) => item.id === diaryId);
  if (!diary) {
    return;
  }

  editingDiaryId = diary.id;
  diaryForm.reset();
  diaryForm.querySelector('[name="title"]').value = diary.title || "";
  diaryRecordTypeSelect.value = diary.recordType || "both";
  syncDiaryBodyFields();
  const legacyBody = diary.body || "";
  diaryBodyInput.value = diary.innerBody || diary.outerBody ? legacyBody : "";
  diaryInnerBodyInput.value =
    diary.innerBody || (diary.recordType === "inner" && !diary.outerBody ? legacyBody : "");
  diaryOuterBodyInput.value =
    diary.outerBody || (diary.recordType === "outer" && !diary.innerBody ? legacyBody : "");
  diaryInnerLabelInput.value = diary.innerLabel || "内側";
  diaryOuterLabelInput.value = diary.outerLabel || "外側";
  diaryMarginLabelInput.value = diary.marginLabel || "余白";
  diaryForm.querySelector('[name="weather"]').value = diary.weather || "clear";
  diaryForm.querySelector('[name="wave"]').value = diary.wave || "calm";
  diaryForm.querySelector('[name="important"]').checked = Boolean(diary.important);
  diarySubmitButton.textContent = "記録を更新する";
  updateRecordShapePreview();
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
    updateRecordShapePreview();
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

  if (kind === "circle") {
    const circle = normalizeCircle(shape.circle);
    shapeForm.querySelector('[name="circleHasCore"]').checked = Boolean(circle.hasCore);
    shapeForm.querySelector('[name="circleCore"]').value = circle.core || "";
    ["circleInner1", "circleInner2", "circleInner3"].forEach((name, index) => {
      shapeForm.querySelector(`[name="${name}"]`).value = circle.inner[index] || "";
    });
    ["circleBoundary1", "circleBoundary2", "circleBoundary3"].forEach((name, index) => {
      shapeForm.querySelector(`[name="${name}"]`).value = circle.boundary[index] || "";
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

  const ok = window.confirm("このかたちを削除しますか。美術館から消えます。");
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

async function downloadShapeImage(shapeId, button) {
  const shape = state.shapes.find((item) => item.id === shapeId);
  if (!shape) {
    return;
  }

  const originalText = button?.textContent || "";
  if (button) {
    button.disabled = true;
    button.textContent = "保存中";
  }

  const filename = `${safeFileName(shape.title || "かたち")}.png`;

  try {
    const svgMarkup = createStandaloneShapeSvg(shape);
    const pngBlob = await svgToPngBlob(svgMarkup);
    triggerDownload(pngBlob, filename);
  } catch (error) {
    console.warn("PNG save failed. Falling back to SVG.", error);
    const svgBlob = new Blob([createStandaloneShapeSvg(shape)], {
      type: "image/svg+xml;charset=utf-8",
    });
    triggerDownload(svgBlob, `${safeFileName(shape.title || "かたち")}.svg`);
  } finally {
    if (button) {
      window.setTimeout(() => {
        button.disabled = false;
        button.textContent = originalText;
      }, 500);
    }
  }
}

function createStandaloneShapeSvg(shape) {
  const rawSvg = renderShapeSvg(shape, "large").trim();
  const withNamespace = rawSvg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  const style = `<defs><style>${SHAPE_DOWNLOAD_STYLE}</style></defs>`;

  return withNamespace.replace(/<svg([^>]*)>/, `<svg$1>${style}`);
}

function svgToPngBlob(svgMarkup) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = 4;
      canvas.width = image.width * scale;
      canvas.height = image.height * scale;
      const context = canvas.getContext("2d");

      context.fillStyle = "#fffdf7";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("PNGに変換できませんでした。"));
        }
      }, "image/png");
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("画像を読み込めませんでした。"));
    };

    image.src = url;
  });
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
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
        boundary: getTextList(formData, ["circleBoundary1", "circleBoundary2", "circleBoundary3"]),
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
      ${renderSvgMultilineText({ x: 88, y: 132, text: arrows.ab, fontSize: arrowTextSize, className: "shape-arrow-text arrow-clockwise", lineHeight: 10 })}
      ${renderSvgMultilineText({ x: 92, y: 86, text: arrows.ba, fontSize: arrowTextSize, className: "shape-arrow-text arrow-counter", lineHeight: 10 })}
      ${renderSvgMultilineText({ x: 112, y: 160, text: arrows.ac, fontSize: arrowTextSize, className: "shape-arrow-text arrow-counter", lineHeight: 10 })}
      ${renderSvgMultilineText({ x: 188, y: 204, text: arrows.ca, fontSize: arrowTextSize, className: "shape-arrow-text arrow-clockwise", lineHeight: 10 })}
      ${renderSvgMultilineText({ x: 212, y: 132, text: arrows.bc, fontSize: arrowTextSize, className: "shape-arrow-text arrow-clockwise", lineHeight: 10 })}
      ${renderSvgMultilineText({ x: 208, y: 86, text: arrows.cb, fontSize: arrowTextSize, className: "shape-arrow-text arrow-counter", lineHeight: 10 })}
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
      ${!size || size !== "mini" ? `
        <path class="shape-hotspot" data-shape-edit="sideAB" tabindex="0" aria-label="辺ABを編集" d="M62 166 L140 50"></path>
        <path class="shape-hotspot" data-shape-edit="sideBC" tabindex="0" aria-label="辺BCを編集" d="M160 50 L238 166"></path>
        <path class="shape-hotspot" data-shape-edit="sideCA" tabindex="0" aria-label="辺CAを編集" d="M70 178 L230 178"></path>
        <circle class="shape-hotspot" data-shape-edit="pointB" tabindex="0" aria-label="頂点Bを編集" cx="150" cy="34" r="24"></circle>
        <circle class="shape-hotspot" data-shape-edit="pointA" tabindex="0" aria-label="頂点Aを編集" cx="54" cy="178" r="24"></circle>
        <circle class="shape-hotspot" data-shape-edit="pointC" tabindex="0" aria-label="頂点Cを編集" cx="246" cy="178" r="24"></circle>
        <circle class="shape-hotspot" data-shape-edit="center" tabindex="0" aria-label="全体メモを編集" cx="150" cy="130" r="34"></circle>
      ` : ""}
      ${arrowTexts}
      ${titleSize ? `<text class="shape-title" x="150" y="228" text-anchor="middle" font-size="${titleSize}">${title}</text>` : ""}
      ${renderSvgMultilineText({ x: 150, y: 23, text: points.b, fallback: "推し", fontSize: labelSize, lineHeight: 12 })}
      ${renderSvgMultilineText({ x: 52, y: 211, text: points.a, fallback: "自分", fontSize: labelSize, lineHeight: 12 })}
      ${renderSvgMultilineText({ x: 248, y: 211, text: points.c, fallback: "第三者", fontSize: labelSize, lineHeight: 12 })}
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
  const boundaryCoords = [
    [150, 176],
    [78, 92],
    [222, 92],
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
  const boundaryTexts = circle.boundary
    .slice(0, textLimit)
    .map((text, index) => {
      const [x, y] = boundaryCoords[index];
      return renderSvgMultilineText({
        x,
        y,
        text,
        fallback: `境界${index + 1}`,
        maxCharsPerLine: 5,
        maxLines: 2,
        fontSize: labelSize,
        className: "circle-label circle-boundary-label",
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
      ${boundaryTexts}
      ${outerTexts}
      ${size !== "mini" ? `
        <rect class="shape-hotspot" data-shape-edit="outer" tabindex="0" aria-label="外側を編集" x="0" y="0" width="300" height="240" rx="16"></rect>
        <circle class="shape-hotspot boundary-hotspot" data-shape-edit="boundary" tabindex="0" aria-label="境界を編集" cx="150" cy="116" r="92"></circle>
        <circle class="shape-hotspot" data-shape-edit="inner" tabindex="0" aria-label="内側を編集" cx="150" cy="116" r="60"></circle>
        <circle class="shape-hotspot" data-shape-edit="center" tabindex="0" aria-label="中心を編集" cx="150" cy="116" r="34"></circle>
      ` : ""}
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
      ${renderSvgMultilineText({ x: leftCx, y: Math.max(28, cy - leftRadius - 8), text: venn.leftLabel, fallback: "自分", fontSize: labelSize, lineHeight: 12 })}
      ${renderSvgMultilineText({ x: rightCx, y: Math.max(28, cy - rightRadius - 8), text: venn.rightLabel, fallback: "相手", fontSize: labelSize, lineHeight: 12 })}
      ${renderVennRegionTexts(venn.leftOnlyTexts, leftCx - leftRadius * 0.34, cy, "左だけ", "venn-region-text")}
      ${renderVennRegionTexts(venn.overlapTexts, 160, cy, "重なり", "venn-region-text venn-overlap-text")}
      ${renderVennRegionTexts(venn.rightOnlyTexts, rightCx + rightRadius * 0.34, cy, "右だけ", "venn-region-text")}
      ${renderSvgMultilineText({ x: 160, y: 198, text: venn.outsideText, fallback: "外側", fontSize: regionSize, className: "venn-outside-text", lineHeight: 12 })}
      <rect class="shape-hotspot" data-shape-edit="outside" tabindex="0" aria-label="外側を編集" x="0" y="0" width="320" height="250" rx="18"></rect>
      <circle class="shape-hotspot" data-shape-edit="leftOnly" tabindex="0" aria-label="左だけの領域を編集" cx="${leftCx - leftRadius * 0.28}" cy="${cy}" r="${leftRadius * 0.48}"></circle>
      <circle class="shape-hotspot" data-shape-edit="rightOnly" tabindex="0" aria-label="右だけの領域を編集" cx="${rightCx + rightRadius * 0.28}" cy="${cy}" r="${rightRadius * 0.48}"></circle>
      <ellipse class="shape-hotspot" data-shape-edit="overlap" tabindex="0" aria-label="重なり部分を編集" cx="160" cy="${cy}" rx="36" ry="64"></ellipse>
      <rect class="shape-hotspot" data-shape-edit="leftLabel" tabindex="0" aria-label="左円ラベルを編集" x="${leftCx - 45}" y="${Math.max(8, cy - leftRadius - 30)}" width="90" height="32" rx="12"></rect>
      <rect class="shape-hotspot" data-shape-edit="rightLabel" tabindex="0" aria-label="右円ラベルを編集" x="${rightCx - 45}" y="${Math.max(8, cy - rightRadius - 30)}" width="90" height="32" rx="12"></rect>
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

function diaryRecordParts(diary) {
  const legacyBody = diary.body || "";
  const hasSplitBody = Boolean(diary.innerBody || diary.outerBody);
  const inner =
    diary.innerBody || (!hasSplitBody && diary.recordType === "inner" ? legacyBody : "");
  const outer =
    diary.outerBody || (!hasSplitBody && diary.recordType === "outer" ? legacyBody : "");
  const margin = hasSplitBody || diary.recordType === "both" ? legacyBody : "";

  return {
    inner,
    outer,
    margin,
    innerLabel: diary.innerLabel || "内側",
    outerLabel: diary.outerLabel || "外側",
    marginLabel: diary.marginLabel || "余白",
  };
}

function renderRecordShapeMini(diary) {
  const parts = diaryRecordParts(diary);
  const innerLabel = shortText(parts.innerLabel, "内側", 10);
  const outerLabel = shortText(parts.outerLabel, "外側", 10);
  const marginLabel = shortText(parts.marginLabel, "余白", 10);
  const classes = [
    "record-shape-mini",
    parts.inner ? "has-inner" : "",
    parts.outer ? "has-outer" : "",
    parts.margin ? "has-margin" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return `
    <div class="${classes}" aria-label="記録のかたち">
      <span class="mini-margin">${escapeHtml(marginLabel)}</span>
      <span class="mini-outer">${escapeHtml(outerLabel)}</span>
      <span class="mini-inner">${escapeHtml(innerLabel)}</span>
    </div>
  `;
}

function renderDiaryExcerpt(diary) {
  const parts = diaryRecordParts(diary);
  const inner = parts.inner ? excerpt(parts.inner) : "";
  const outer = parts.outer ? excerpt(parts.outer) : "";
  const margin = parts.margin ? excerpt(parts.margin) : "";

  if (inner || outer || margin) {
    return `
      <div class="diary-split-excerpt">
        ${inner ? `<p><strong>${escapeHtml(parts.innerLabel)}</strong>${escapeHtml(inner)}</p>` : ""}
        ${outer ? `<p><strong>${escapeHtml(parts.outerLabel)}</strong>${escapeHtml(outer)}</p>` : ""}
        ${margin ? `<p><strong>${escapeHtml(parts.marginLabel)}</strong>${escapeHtml(margin)}</p>` : ""}
      </div>
    `;
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
  fontSize = 11,
  className = "",
  lineHeight = 12,
}) {
  const lines = splitShapeCellText(text || fallback);
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

function renderVennRegionTexts(texts, x, y, fallback, className) {
  const visibleTexts = texts.length > 0 ? texts.slice(0, 3) : [fallback];
  const lineHeight = 11;
  const itemGap = 3;
  const prepared = visibleTexts.map((text) => splitShapeCellText(text || fallback));
  const totalHeight =
    prepared.reduce((height, lines) => height + (lines.length - 1) * lineHeight, 0) +
    (prepared.length - 1) * (lineHeight + itemGap);
  let cursorY = y - totalHeight / 2;
  const tspans = prepared
    .map((lines, itemIndex) => {
      const itemText = lines
        .map((line, lineIndex) => {
          const yAttribute =
            itemIndex === 0 && lineIndex === 0 ? ` y="${cursorY}"` : ` dy="${lineHeight}"`;
          return `<tspan x="${x}"${yAttribute}>${escapeHtml(line)}</tspan>`;
        })
        .join("");
      cursorY += lines.length * lineHeight + itemGap;
      return itemText;
    })
    .join("");

  return `<text class="${className}" text-anchor="middle" font-size="10.5">${tspans}</text>`;
}

function splitShapeCellText(value) {
  const chars = Array.from(String(value || "").trim()).slice(0, SHAPE_TEXT_MAX_LENGTH);
  if (chars.length === 0) {
    return [""];
  }

  if (chars.length < SHAPE_TEXT_WRAP_THRESHOLD) {
    return [chars.join("")];
  }

  let splitIndex = Math.ceil(chars.length / 2);
  if (chars.length - splitIndex < 2) {
    splitIndex = chars.length - 2;
  }

  return [chars.slice(0, splitIndex).join(""), chars.slice(splitIndex).join("")];
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
  const legacyBoundary = typeof circle.boundary === "string" ? [circle.boundary] : circle.boundary;
  const legacyOuter = typeof circle.outer === "string" ? [circle.outer] : circle.outer;
  const inner = Array.isArray(legacyInner) ? legacyInner.filter(Boolean).slice(0, 3) : [];
  const boundary = Array.isArray(legacyBoundary) ? legacyBoundary.filter(Boolean).slice(0, 3) : [];
  const outer = Array.isArray(legacyOuter) ? legacyOuter.filter(Boolean).slice(0, 3) : [];
  const hasCore = circle.hasCore === undefined ? Boolean(circle.core) : Boolean(circle.hasCore);
  return {
    hasCore,
    core: circle.core || "",
    inner: inner.length > 0 ? inner : ["内側"],
    boundary,
    outer: outer.length > 0 ? outer : ["外側"],
  };
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

function safeFileName(value) {
  const normalized = String(value || "shape")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 40);
  return normalized || "shape";
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
