export const svgArrowLeft = `
  <svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" class="ember-view">
    <path d="M11 15.5l-7-7 7-7zM10 3.914L5.414 8.5 10 13.086z" />
  </svg>
`;

export const svgArrowRight = `
  <svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" class="ember-view">
    <path d="M5 1.5l7 7-7 7zm1 11.586L10.586 8.5 6 3.914z" />
  </svg>
`;

export function createReduceOrIncrease(reduceOrIncrease) {
  return `
    <img src="./assets/icons/${reduceOrIncrease}-screen.png" alt="${reduceOrIncrease}-screen.png">
  `;
}
