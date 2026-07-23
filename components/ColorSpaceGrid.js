
/*
* From:https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Colors/Color_format_converter Start
*/
const LRGB_LMS_MATRIX = [
  [0.4122214708, 0.5363325363, 0.0514459929],
  [0.2119034982, 0.6806995451, 0.1073969566],
  [0.0883024619, 0.2817188376, 0.6299787005],
];

const LMS_LAB_MATRIX = [
  [+0.2104542553, +0.793617785, -0.0040720468],
  [+1.9779984951, -2.428592205, +0.4505937099],
  [+0.0259040371, +0.7827717662, -0.808675766],
];

// srgb-linear to xyz-d50
// matrix taken from http://www.brucelindbloom.com/index.html?Eqn_RGB_to_XYZ.html
const LRGB_XYZ_D50_MATRIX = [
  [0.4360747, 0.3850649, 0.1430804],
  [0.2225045, 0.7168786, 0.0606169],
  [0.0139322, 0.0971045, 0.7141733],
];

// srgb-linear to xyz-d65
// matrix taken from http://www.brucelindbloom.com/index.html?Eqn_RGB_to_XYZ.html
const LRGB_XYZ_D65_MATRIX = [
  [0.4124564, 0.3575761, 0.1804375],
  [0.2126729, 0.7151522, 0.072175],
  [0.0193339, 0.119192, 0.9503041],
];

const currentColor = { r: 186, g: 218, b: 85, alpha: 1.0 }; // #bada55

function multiplyByMatrix(matrix, tuple) {
  let i = [0, 0, 0];
  let j = matrix.length;
  let k = matrix[0].length;
  for (let l = 0; l < j; l++)
    for (let m = 0; m < k; m++) i[l] += matrix[l][m] * tuple[m];
  return i;
}

function rgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function intToHex(i) {
  return Math.floor(i).toString(16).padStart(2, "0").toLowerCase();
}

function rgbToHEXText(c) {
  return `#${intToHex(c.r)}${intToHex(c.g)}${intToHex(c.b)}`;
}

function rgbaToHEXAText(color) {
  const hexText = rgbToHEXText(color);
  if (color.alpha === 1.0) {
    return hexText;
  }
  const alpha = intToHex(color.alpha * 255);
  return `${hexText}${alpha}`;
}

function rgbaToHSLA(color) {
  let { r, g, b, alpha } = color;
  // Let's have r, g, b in the range [0, 1]
  r /= 255;
  g /= 255;
  b /= 255;
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  const delta = max - min;
  let h, s, l;

  if (delta === 0) {
    h = 0;
  } else if (max === r) {
    h = ((g - b) / delta) % 6;
  } else if (max === g) {
    h = (b - r) / delta + 2;
  } else h = (r - g) / delta + 4;
  h = Math.round(h * 60);

  // We want an angle between 0 and 360°
  if (h < 0) {
    h += 360;
  }

  l = (max + min) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = Number((s * 100).toFixed(1));
  l = Number((l * 100).toFixed(1));

  return { h, s, l, alpha };
}

function toHSLAText(color) {
  const { h, s, l, alpha } = rgbaToHSLA(color);
  return `hsl(${h.toFixed(0)} ${s.toFixed(0)}% ${l.toFixed(0)}%${
    alpha < 1.0 ? ` / ${alpha.toFixed(3)}` : ""
  })`;
}

function rgbaToHWBAText(color) {
  let { h, s, l, alpha } = rgbaToHSLA(color);
  const chroma = s * (1 - Math.abs(l / 50 - 1));
  let W = (l - chroma / 2).toFixed(0);
  let B = (100 - l - chroma / 2).toFixed(0);
  return `hwb(${h} ${W}% ${B}%${alpha < 1.0 ? ` / ${alpha.toFixed(3)}` : ""})`;
}

function rgbaToXYZD50(color) {
  let { r, g, b, alpha } = color;
  r = rgbToLinear(r / 255) * 255;
  g = rgbToLinear(g / 255) * 255;
  b = rgbToLinear(b / 255) * 255;

  const xyz = multiplyByMatrix(LRGB_XYZ_D50_MATRIX, [r, g, b]);
  return { x: xyz[0] / 255, y: xyz[1] / 255, z: xyz[2] / 255, alpha };
}

function rgbaToXYZD50Text(color) {
  let { alpha } = color;
  const xyz = rgbaToXYZD50(color);
  return `color(xyz-d50 ${xyz.x.toFixed(5)} ${xyz.y.toFixed(5)} ${xyz.z.toFixed(
    5,
  )}${alpha < 1.0 ? ` / ${alpha.toFixed(3)}` : ""})`;
}

function rgbaToXYZD65(color) {
  let { r, g, b, alpha } = color;
  r = rgbToLinear(r / 255) * 255;
  g = rgbToLinear(g / 255) * 255;
  b = rgbToLinear(b / 255) * 255;

  const xyz = multiplyByMatrix(LRGB_XYZ_D65_MATRIX, [r, g, b]);
  return { x: xyz[0] / 255, y: xyz[1] / 255, z: xyz[2] / 255, alpha };
}

function rgbaToXYZD65Text(color) {
  let { alpha } = color;
  const xyz = rgbaToXYZD65(color);
  return `color(xyz-d65 ${xyz.x.toFixed(5)} ${xyz.y.toFixed(5)} ${xyz.z.toFixed(
    5,
  )}${alpha < 1.0 ? ` / ${alpha.toFixed(3)}` : ""})`;
}

const D65 = [0.3457 / 0.3585, 1, 0.2958 / 0.3585];
function xyzToLab(color) {
  let { x, y, z, alpha } = color;
  [x, y, z] = [x, y, z].map((v, i) => {
    v /= D65[i];
    return v > 0.0088564516 ? Math.cbrt(v) : v * 903.2962962962963 + 16 / 116;
  });
  return { l: 116 * y - 16, a: 500 * (x - y), b: 200 * (y - z), alpha };
}

function rgbaToLabText(color) {
  let { alpha } = color;
  const xyz = rgbaToXYZD50(color);
  const lab = xyzToLab(xyz);
  return `lab(${lab.l.toFixed(3)} ${lab.a.toFixed(3)} ${lab.b.toFixed(3)}${
    alpha < 1.0 ? ` / ${alpha.toFixed(3)}` : ""
  })`;
}

function rgbToOklab(color) {
  let { r, g, b, alpha } = color;
  r = rgbToLinear(r / 255);
  g = rgbToLinear(g / 255);
  b = rgbToLinear(b / 255);
  const lms = multiplyByMatrix(LRGB_LMS_MATRIX, [r, g, b]).map((v) =>
    Math.cbrt(v),
  );

  const oklab = multiplyByMatrix(LMS_LAB_MATRIX, lms);
  return { l: oklab[0], a: oklab[1], b: oklab[2], alpha };
}

function toOkLabText(color) {
  let { alpha } = color;
  const oklab = rgbToOklab(color);
  return `oklab(${oklab.l.toFixed(5)} ${oklab.a.toFixed(5)} ${oklab.b.toFixed(
    5,
  )}${alpha < 1.0 ? ` / ${alpha.toFixed(3)}` : ""})`;
}

function labToLCH(color) {
  const { l, a, b, alpha } = color;
  const c = Math.sqrt(a * a + b * b);
  let h = Math.atan2(b, a) * (180 / Math.PI);
  if (h < 0) {
    h += 360;
  }
  return { l, c, h, alpha };
}

function toLCHText(color) {
  let { alpha } = color;
  const xyz = rgbaToXYZD50(color);
  const lab = xyzToLab(xyz);
  const lch = labToLCH(lab);
  return `lch(${lch.l.toFixed(3)} ${lch.c.toFixed(3)} ${lch.h.toFixed(3)}${
    alpha < 1.0 ? ` / ${alpha.toFixed(3)}` : ""
  })`;
}

function rgbaToOkLCh(color) {
  const lab = rgbToOklab(color);
  const oklch = labToLCH(lab);
  return { l: oklch.l, c: oklch.c, h: oklch.h, alpha: color.alpha };
}

function toOkLChText(color) {
  let { alpha } = color;
  const oklch = rgbaToOkLCh(color);
  return `oklch(${oklch.l.toFixed(5)} ${oklch.c.toFixed(5)} ${oklch.h.toFixed(
    5,
  )}${alpha < 1.0 ? ` / ${alpha.toFixed(3)}` : ""})`;
}

function colorToRGBA(c) {
  const ctx = new OffscreenCanvas(1, 1).getContext("2d");
  ctx.fillStyle = c;
  ctx.fillRect(0, 0, 1, 1);
  const data = ctx.getImageData(0, 0, 1, 1).data;
  return {
    r: data[0],
    g: data[1],
    b: data[2],
    alpha: data[3] / 255,
  };
}
/*
* From:https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Colors/Color_format_converter End
*/

function convertFromRGB(type, c) {
  switch(type) {
    case "hex": { return rgbaToHEXAText(c) };
    case "hsl": { return toHSLAText(c) };
    case "hwb": { return rgbaToHWBAText(c) };
    case "color": { return `color(srgb ${(c.r / 255).toFixed(3)} ${(c.g / 255).toFixed(3)} ${(c.b / 255).toFixed(3)}${c.alpha < 1 ? ` / ${c.alpha.toFixed(3)}` : ""})` };
    case "lab": { return rgbaToLabText(c) };
    case "lch": { return toLCHText(c) };
    case "oklab": { return toOkLabText(c) };
    case "oklch": { return toOkLChText(c) };
    case "xyz-d50": { return rgbaToXYZD50Text(c) };
    case "xyz-d65": { return rgbaToXYZD65Text(c) };
  }
  return `rgb(${c.r} ${c.g} ${c.b} / ${c.alpha})`;
}

class ColorSpaceGrid extends CustomHTMLElement {
  #color = 'rgb(0 0 0)';
  #colorValues = {
  //For more info go to: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/rgb'
  "rgb": {
    el: null,
    elView: null,
    options:[
        
    ],
    current: 'rgb(0 0 0)',
    text: `
    The rgb() functional notation expresses a color in the sRGB color space according to its red, green, and blue components. An optional alpha component represents the color's transparency.
    `,
    code: `
      /* Absolute values */
      rgb(255 255 255)
      rgb(255 255 255 / 50%)

      /* Relative values */
      rgb(from green r g b / 0.5)
      rgb(from #123456 calc(r + 40) calc(g + 40) b)
      rgb(from hwb(120deg 10% 20%) r g calc(b + 200))

      /* Legacy 'rgba()' alias */
      rgba(0 255 255)

      /* Legacy format */
      rgb(0, 255, 255)
      rgb(0, 255, 255, 50%)
    `
  },
  //For more info go to: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/hex-color'
  "hex": {
    el: null,
    elView: null,
    options:[
        
    ],
    current: '#000000',
    text: `The <hex-color> CSS data type is a notation for describing the hexadecimal color syntax of an sRGB color using its primary color components (red, green, blue) written as hexadecimal numbers, as well as its transparency.`,
    code: `
      #RGB        // The three-value syntax
      #RGBA       // The four-value syntax
      #RRGGBB     // The six-value syntax
      #RRGGBBAA   // The eight-value syntax
    `,
  },
  //For more info go to: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/hsl'
  "hsl": {
    el: null,
    elView: null,
    options:[
        
    ],
    current: 'hsl(0 0% 0%)',
    text: `The hsl() functional notation expresses a color in the sRGB color space according to its hue, saturation, and lightness components. An optional alpha component represents the color's transparency.`,
    code: `
      /* Absolute values */
      hsl(120deg 75% 25%)
      hsl(120 75 25) /* deg and % units are optional */
      hsl(120deg 75% 25% / 60%)
      hsl(none 75% 25%)

      /* Relative values */
      hsl(from green h s l / 0.5)
      hsl(from #123456 h s calc(l + 20))
      hsl(from rgb(200 0 0) calc(h + 30) s calc(l + 30))

      /* Legacy 'hsla()' alias */
      hsla(120deg 75% 25% / 60%)

      /* Legacy format */
      hsl(120, 75%, 25%)
      hsl(120deg, 75%, 25%, 0.8)
    `,
  },
  //For more info go to: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/hwb'
  "hwb": {
    el: null,
    elView: null,
    options:[
        
    ],
    current: 'hwb(0 0% 100%)',
    text: `The hwb() functional notation expresses a color in the sRGB color space according to its hue, whiteness, and blackness. An optional alpha component represents the color's transparency.`,
    code: `
      /* Absolute values */
      hwb(194 0% 0%)
      hwb(194 0% 0% / .5)

      /* Relative values */
      hwb(from green h w b / 0.5)
      hwb(from #123456 h calc(w + 30) b)
      hwb(from lch(40% 70 240deg) h w calc(b - 30))
    `,
  },
  //For more info go to: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/color'
  "color": {
    el: null,
    elView: null,
    options:[
        
    ],
    current: 'color(srgb 0.000 0.000 0.000)',
    text: `The color() functional notation allows a color to be specified in a particular, specified color space rather than the implicit sRGB color space that most of the other color functions operate in.`,
    code: `
      /* Absolute values */
      color(display-p3 1 0.5 0);
      color(display-p3 1 0.5 0 / .5);

      /* Relative values */
      color(from green srgb r g b / 0.5)
      color(from #123456 xyz calc(x + 0.75) y calc(z - 0.35))
    `,
  },
  //For more info go to: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/lab'
  "lab": {
    el: null,
    elView: null,
    options:[
        
    ],
    current: 'lab(0.000 0.000 0.000)',
    text: `The lab() functional notation expresses a given color in the CIE L*a*b* color space.

Lab represents the entire range of colors that humans can see by specifying the color's lightness, a red/green axis value, a blue/yellow axis value, and an optional alpha transparency value.`,
    code: `
      /* Absolute values */
      lab(29.2345% 39.3825 20.0664);
      lab(52.2345% 40.1645 59.9971);
      lab(52.2345% 40.1645 59.9971 / .5);

      /* Relative values */
      lab(from green l a b / 0.5)
      lab(from #123456 calc(l + 10) a b)
      lab(from hsl(180 100% 50%) calc(l - 10) a b)
    `,
  },
  //For more info go to: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/lch'
  "lch": {
    el: null,
    elView: null,
    options:[
        
    ],
    current: 'lch(0.000 0.000 0.000)',
    text: `The lch() functional notation expresses a given color using the LCH color space, which represents lightness, chroma, and hue. It uses the same L axis as the lab() color function of the CIELab color space, but it uses the polar coordinates C (Chroma) and H (Hue).`,
    code: `
      /* Absolute values */
      lch(29.2345% 44.2 27);
      lch(52.2345% 72.2 56.2);
      lch(52.2345% 72.2 56.2 / .5);

      /* Relative values */
      lch(from green l c h / 0.5)
      lch(from #123456 calc(l + 10) c h)
      lch(from hsl(180 100% 50%) calc(l - 10) c h)
      lch(from var(--color-value) l c h / calc(alpha - 0.1))        
    `,
  },
  //For more info go to: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/oklab'
  "oklab": {
    el: null,
    elView: null,
    options:[
        
    ],
    current: 'oklab(0.00000 0.00000 0.00000)',
    text: `
      The oklab() functional notation expresses a given color in the Oklab color space, which attempts to mimic how color is perceived by the human eye.

      Oklab is a perceptual color space and is useful to:

      Transform an image to grayscale, without changing its lightness.
      Modify the saturation of colors, while keeping user perception of hue and lightness
      Create smooth and uniform gradients of colors (when interpolated manually, for example, in a <canvas> element).
      oklab() works with a Cartesian coordinate system on the Oklab color space — a- and b-axes. It can represent a wider range of colors than RGB, including wide-gamut and P3 colors. If you want a polar color system, chroma and hue, use oklch().
    `,
    code: `
      /* Absolute values */
      oklab(40.1% 0.1143 0.045);
      oklab(59.69% 0.1007 0.1191);
      oklab(59.69% 0.1007 0.1191 / 0.5);

      /* Relative values */
      oklab(from green l a b / 0.5)
      oklab(from #123456 calc(l + 0.1) a b / calc(alpha * 0.9))
      oklab(from hsl(180 100% 50%) calc(l - 0.1) a b)
    `,
  },
  //For more info go to: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/oklch'
  "oklch": {
    el: null,
    elView: null,
    options:[
        
    ],
    current: 'oklch(0.00000 0.00000 0.00000)',
    text: `
The oklch() functional notation expresses a given color in the Oklab color space. oklch() is the cylindrical form of oklab(), using the same L axis, but with polar Chroma (C) and Hue (h) coordinates.
    `,
    code: `
      /* Absolute values */
      oklch(40.1% 0.123 21.57)
      oklch(59.69% 0.156 49.77)
      oklch(59.69% 0.156 49.77 / .5)

      /* Relative values */
      oklch(from green l c h / 0.5)
      oklch(from #123456 calc(l + 0.1) c h)
      oklch(from hsl(180 100% 50%) calc(l - 0.1) c h)
      oklch(from var(--color) l c h / calc(alpha - 0.1))
    `,
  },
  //For more info go to: 'https://developer.mozilla.org/en-US/docs/Glossary/Color_space#xyz-d50'
  "xyz-d50": {
    el: null,
    elView: null,
    options:[
        
    ],
    current: 'color(xyz-d50 0.00000 0.00000 0.00000)',
    text: `
    xyz-d50 is the same as xyz-d65 except it uses D50 as the whitepoint.
    `,
    code: `
        
    `,
  },
  //For more info go to: 'https://developer.mozilla.org/en-US/docs/Glossary/Color_space#xyz'
  "xyz-d65": {
    el: null,
    elView: null,
    options:[
        
    ],
    current: 'color(xyz-d65 0.00000 0.00000 0.00000)',
    text: `
The xyz identifier is a synonym for the xyz-d65 color space. The axes are not limited to a 0 to 1 range as the color space is not bound to this range; these values are only used as reference points in defining percentage inputs and outputs. The whitepoint is D65.
    `,
    code: `
        
    `,
  },
};
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();

    this.appendStylesheet(`
      .border {
        border: 1px solid #eee;
      }
      .col1 {
        min-height: 350px;
        background: #fbfbfd;
        border: 1px solid #eee;
        grid-column: span 12/span 12;
        padding: 12px;
        color: #555;
      }
      .col2 {
        min-height: 350px;
        background: #fbfbfd;
        border: 1px solid #eee;
        grid-column: span 6/span 6;
        padding: 12px;
        color: #555;
      }
      .col4 {
        min-height: 125px;
        background: #fbfbfd;
        border: 1px solid #eee;
        grid-column: span 3/span 3;
        padding: 12px;
        color: #555;
      }
      .listicle {
        border: 1px solid #eee;
        padding: 8px 16px;
        margin-bottom: 8px;
      }
      .listicle:last-child {
        border: 1px solid #eee;
        padding: 8px 16px;
        margin-bottom: 0px;
      }
      .cardicle {
        border: 1px solid #eee;
        padding: 8px 16px;
        box-shadow: rgba(69, 69, 69, 0.69) -1px 2px 10px -2px;
      }
      .flex {
        display: flex;
        gap: 16px;
      }
      .flex-wrap {
        flex-wrap: wrap;
      }
    `);

    const colorValues = this.#colorValues;
    
    const colorValuesKeys = Object.keys(colorValues);

    const converterWrapper = document.createElement("div");
    converterWrapper.setAttribute("class", "grid");
    converterWrapper.setAttribute("style", "padding-bottom: 16px;");

    const header = document.createElement("div");
    header.setAttribute("class", "");
    header.setAttribute("style", "margin-bottom: 16px;background: #fbfbfd;padding: 12px;border: 1px solid #eee;");

    {

      const wrapper = document.createElement("div");
      wrapper.setAttribute("class", "grid");
      wrapper.setAttribute("style", "");

      const heading = document.createElement("h1");
      heading.setAttribute("class", "");
      heading.setAttribute("style", "margin: 0px 0px 8px 0px;");
      heading.innerText = `Color Space`;

      const p = document.createElement("p");
      p.setAttribute("class", "");
      p.setAttribute("style", "margin-bottom: 24px;");
      p.innerText = `Convert colors into different color values.`;

      const input1 = document.createElement("input");
      input1.setAttribute("class", "");
      input1.setAttribute("type", "text");
      input1.setAttribute("disabled", "true");
      input1.setAttribute("value", this.#color);
      input1.setAttribute("style", "width: 100%;");

      const input2 = document.createElement("input");
      input2.setAttribute("class", "");
      input2.setAttribute("type", "color");
      input2.setAttribute("value", this.#color);
      input2.setAttribute("style", "width: 100%;");
      
      this.colorChanged = (e) => {
        this.#color = e.target.value;
        const text = e.target.value;

        const r = parseInt(text.slice(1, 3), 16);
        const g = parseInt(text.slice(3, 5), 16);
        const b = parseInt(text.slice(5, 7), 16);

        this.colorTextInput.setAttribute("value", `rgb(${r} ${g} ${b})`);

        colorValuesKeys.forEach((key, i, value) => {
          const colorText = convertFromRGB(key, {r, g, b, alpha: parseFloat(this.alphaText.value)});
          colorValues[key].el.setAttribute("value", colorText);
          colorValues[key].elView.setAttribute("style", `position: relative;background: ${colorText}`);
        });

      };

      this.colorInput = input2;
      this.colorTextInput = input1;
      this.colorInput.addEventListener('change', this.colorChanged);

      const input3 = document.createElement("input");
      input3.setAttribute("class", "");
      input3.setAttribute("type", "range");
      input3.setAttribute("value", "1");
      input3.setAttribute("min", "0");
      input3.setAttribute("max", "1");
      input3.setAttribute("step", "0.01");
      input3.setAttribute("style", "width: 100%;");

      this.alphaText = input3;

      
      header.appendChild(heading);
      header.appendChild(p);
      wrapper.appendChild(input1);
      wrapper.appendChild(input2);
      wrapper.appendChild(input3);
      header.appendChild(wrapper);
    }

    {
      const ldiv = document.createElement("div");
      ldiv.setAttribute("class", "col2");

      const rdiv = document.createElement("div");
      rdiv.setAttribute("class", "col2");

      const f = document.createElement("div");
      f.setAttribute("class", "grid");

      colorValuesKeys.forEach((key, i, value) => {
        const div1 = document.createElement("div");
        div1.setAttribute("class", "listicle");
        div1.setAttribute("style", "overflow: hidden;");

        {
          const div2 = document.createElement("div");
          div2.setAttribute("class", "grid");
          const div21 = document.createElement("div");
          div21.setAttribute("class", "");
          div21.setAttribute("style", "grid-column: span 2/span 2;");
          div21.innerText = key.toUpperCase();
          const div22 = document.createElement("div");
          div22.setAttribute("class", "");
          div22.setAttribute("style", "grid-column: span 6/span 6;");
          const div23 = document.createElement("div");
          div23.setAttribute("class", "flex");
          div23.setAttribute("style", "grid-column: span 2/span 2;");
          /*const select = document.createElement("select");
          select.setAttribute("class", "");
          const option = document.createElement("option");
          option.setAttribute("value", "");
          option.innerText = 'Select';
          select.appendChild(option);

          const button = document.createElement("button");
          button.setAttribute("class", "");
          button.setAttribute("style", "");
          button.innerText = `Copy`;*/


          const input = document.createElement("input");
          input.setAttribute("class", "");
          input.setAttribute("type", "text");
          input.setAttribute("disabled", "true");
          input.setAttribute("value", colorValues[key].current);
          input.setAttribute("style", "width: 100%;");
          colorValues[key].el = input;

          div22.appendChild(input);
          //div23.appendChild(select);
          //div23.appendChild(button);

          div2.appendChild(div21);
          div2.appendChild(div22);
          div2.appendChild(div23);
          div1.appendChild(div2);
        }

        ldiv.appendChild(div1);

        const div2 = document.createElement("div");
        div2.setAttribute("class", "col4 cardicle border");
        div2.setAttribute("style", `position: relative;background: ${colorValues[key].current}`);
        colorValues[key].elView = div2;
        

        const div3 = document.createElement("div");
        div3.setAttribute("class", "");
        div3.setAttribute("style", `position: absolute; top: 1px; right: 1px;background: #fff;padding: 4px 8px;`);
        div3.innerText = key.toUpperCase();

        div2.appendChild(div3);
        f.appendChild(div2);

      });

      rdiv.appendChild(f);
      converterWrapper.appendChild(ldiv);
      converterWrapper.appendChild(rdiv);
    }


    const childrens = [];

    colorValuesKeys.forEach((key) => {

      const div = document.createElement("div");
      div.setAttribute("class", "col1");

      const heading = document.createElement("h2");
      heading.setAttribute("class", "");
      heading.setAttribute("style", "margin-top:0px;");
      heading.innerText = key.toUpperCase();

      const p = document.createElement("p");
      p.setAttribute("class", "");
      p.setAttribute("style", "margin-top:0px;font-size: 1.25em;");
      p.innerText = `${colorValues[key].text.trim()}`

      div.appendChild(heading);
      div.appendChild(p);

      if(colorValues[key].code.trim()) {
        const code = document.createElement("code");
        code.setAttribute("class", "");
        code.setAttribute("style", "");
        code.innerText = `${colorValues[key].code.trim()}`;

        const codewrapper = document.createElement("div");
        codewrapper.setAttribute("class", "border");
        codewrapper.setAttribute("style", "margin-top:10px;font-size: 1.05em;padding: 12px;box-shadow: 0px 1px 19px 5px #e0dee9 inset;");
        codewrapper.appendChild(code);

        div.appendChild(codewrapper);

      }
      

      childrens.push(div);
    })


    const div = document.createElement("div");
    div.setAttribute("class", "");

    const div1 = document.createElement("div");
    div1.setAttribute("class", "grid");

    const div2 = document.createElement("div");
    div2.setAttribute("class", "border");
    div2.setAttribute("style", "padding: 6px; margin: 0px 0px 10px 0px; background: #5b935b; color: #b6d4b6;");
    div2.innerText = `Got inspired from https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Colors/Color_format_converter`;

    div.appendChild(div2);
    div.appendChild(header);
    div.appendChild(converterWrapper);
    div.appendChild(div1);
    

    childrens.forEach((child)=>{
      div1.appendChild(child);
    })

    this.setChild(div);

  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.colorInput.removeEventListener('change', this.colorChanged)
    colorValuesKeys.forEach((key, i, value) => {
      colorValues[key].el = null;
      colorValues[key].elView = null;
    });
  }
  

}
customElements.define("color-space", ColorSpaceGrid);

