// Data by Wittgenstein Centre (2024) – processed by Our World in Data
// Derived from https://ourworldindata.org/grapher/world-population-level-education?time=2020&v=1&csvType=filtered&useColumnShortNames=false
// Year 2020

const fullData = {
  postSecondary: 943559700,
  upperSecondary: 1652627700,
  lowerSecondary: 1230863700,
  primary: 825392700,
  incompletePrimary: 383431500,
  none: 756762400,
  under15yo: 2012336100,
};

const populationTotal = Object.values(fullData).reduce((acc, value) => acc + value, 0);

const numberFormat = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const parseNumber = (value: number) => {
  return parseFloat(numberFormat.format(value));
};

const formatter = (value: number) => {
  return parseNumber((value / populationTotal) * 100);
};

const formattedData = Object.fromEntries(
  Object.entries(fullData).map(([key, value]) => [key, formatter(value)]),
);

export const populationByEducationLevelPercentage = {
  total: 100,
  primary: parseNumber(
    formattedData.primary +
      formattedData.lowerSecondary +
      formattedData.upperSecondary +
      formattedData.postSecondary,
  ),
  lowerSecondary: parseNumber(
    formattedData.lowerSecondary + formattedData.upperSecondary + formattedData.postSecondary,
  ),
  upperSecondary: parseNumber(formattedData.upperSecondary + formattedData.postSecondary),
  postSecondary: parseNumber(formattedData.postSecondary),
};

export const populationByEducationLevelAbsolute = {
  total: populationTotal,
  primary:
    fullData.primary + fullData.lowerSecondary + fullData.upperSecondary + fullData.postSecondary,
  lowerSecondary: fullData.lowerSecondary + fullData.upperSecondary + fullData.postSecondary,
  upperSecondary: fullData.upperSecondary + fullData.postSecondary,
  postSecondary: fullData.postSecondary,
};
