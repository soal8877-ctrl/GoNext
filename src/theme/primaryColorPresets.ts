/** Пресеты основного (primary) цвета Material — ровно 10 вариантов. */
export type PrimaryColorPreset = {
  id: string;
  label: string;
  /** Цвет кружка в настройках и `colors.primary`. */
  swatch: string;
  primary: string;
  onPrimary: string;
  primaryContainerLight: string;
  onPrimaryContainerLight: string;
  primaryContainerDark: string;
  onPrimaryContainerDark: string;
  secondaryContainerLight: string;
  onSecondaryContainerLight: string;
  secondaryContainerDark: string;
  onSecondaryContainerDark: string;
};

export const PRIMARY_COLOR_PRESETS: PrimaryColorPreset[] = [
  {
    id: 'blue',
    label: 'Голубой',
    swatch: '#208AEF',
    primary: '#208AEF',
    onPrimary: '#FFFFFF',
    primaryContainerLight: '#D1E4FF',
    onPrimaryContainerLight: '#001D36',
    primaryContainerDark: '#004A77',
    onPrimaryContainerDark: '#D1E4FF',
    secondaryContainerLight: '#D7E3F7',
    onSecondaryContainerLight: '#101C2B',
    secondaryContainerDark: '#3B4858',
    onSecondaryContainerDark: '#D7E3F7',
  },
  {
    id: 'teal',
    label: 'Бирюзовый',
    swatch: '#00897B',
    primary: '#006A62',
    onPrimary: '#FFFFFF',
    primaryContainerLight: '#6FF7EF',
    onPrimaryContainerLight: '#00201D',
    primaryContainerDark: '#00504A',
    onPrimaryContainerDark: '#6FF7EF',
    secondaryContainerLight: '#CDE8E4',
    onSecondaryContainerLight: '#06201C',
    secondaryContainerDark: '#334B47',
    onSecondaryContainerDark: '#B7CCC8',
  },
  {
    id: 'green',
    label: 'Зелёный',
    swatch: '#43A047',
    primary: '#386A20',
    onPrimary: '#FFFFFF',
    primaryContainerLight: '#B9F396',
    onPrimaryContainerLight: '#082100',
    primaryContainerDark: '#2D4F11',
    onPrimaryContainerDark: '#B9F396',
    secondaryContainerLight: '#DDE8D0',
    onSecondaryContainerLight: '#121F0C',
    secondaryContainerDark: '#3E4A36',
    onSecondaryContainerDark: '#DDE8D0',
  },
  {
    id: 'lime',
    label: 'Лайм',
    swatch: '#C0CA33',
    primary: '#5C6316',
    onPrimary: '#FFFFFF',
    primaryContainerLight: '#E0E776',
    onPrimaryContainerLight: '#1A1E00',
    primaryContainerDark: '#464C00',
    onPrimaryContainerDark: '#E0E776',
    secondaryContainerLight: '#E5E8C0',
    onSecondaryContainerLight: '#1B1D0F',
    secondaryContainerDark: '#47483A',
    onSecondaryContainerDark: '#E5E8C0',
  },
  {
    id: 'orange',
    label: 'Оранжевый',
    swatch: '#FB8C00',
    primary: '#8E4C00',
    onPrimary: '#FFFFFF',
    primaryContainerLight: '#FFDBCA',
    onPrimaryContainerLight: '#321300',
    primaryContainerDark: '#6D3A00',
    onPrimaryContainerDark: '#FFDBCA',
    secondaryContainerLight: '#F5DED5',
    onSecondaryContainerLight: '#231912',
    secondaryContainerDark: '#4B3F38',
    onSecondaryContainerDark: '#F5DED5',
  },
  {
    id: 'red',
    label: 'Красный',
    swatch: '#E53935',
    primary: '#BA1A1A',
    onPrimary: '#FFFFFF',
    primaryContainerLight: '#FFDAD6',
    onPrimaryContainerLight: '#410002',
    primaryContainerDark: '#93000A',
    onPrimaryContainerDark: '#FFDAD6',
    secondaryContainerLight: '#F5DDDA',
    onSecondaryContainerLight: '#2C1512',
    secondaryContainerDark: '#534341',
    onSecondaryContainerDark: '#F5DDDA',
  },
  {
    id: 'pink',
    label: 'Розовый',
    swatch: '#D81B60',
    primary: '#984061',
    onPrimary: '#FFFFFF',
    primaryContainerLight: '#FFD9E2',
    onPrimaryContainerLight: '#3E001D',
    primaryContainerDark: '#7A2949',
    onPrimaryContainerDark: '#FFD9E2',
    secondaryContainerLight: '#F3DDE4',
    onSecondaryContainerLight: '#22191C',
    secondaryContainerDark: '#4C4548',
    onSecondaryContainerDark: '#F3DDE4',
  },
  {
    id: 'purple',
    label: 'Фиолетовый',
    swatch: '#8E24AA',
    primary: '#7D3498',
    onPrimary: '#FFFFFF',
    primaryContainerLight: '#F6D9FF',
    onPrimaryContainerLight: '#2F0C44',
    primaryContainerDark: '#632B7B',
    onPrimaryContainerDark: '#F6D9FF',
    secondaryContainerLight: '#EBDDF0',
    onSecondaryContainerLight: '#211525',
    secondaryContainerDark: '#4A454D',
    onSecondaryContainerDark: '#EBDDF0',
  },
  {
    id: 'indigo',
    label: 'Индиго',
    swatch: '#3949AB',
    primary: '#4E5BA7',
    onPrimary: '#FFFFFF',
    primaryContainerLight: '#DEE0FF',
    onPrimaryContainerLight: '#0A154B',
    primaryContainerDark: '#364388',
    onPrimaryContainerDark: '#DEE0FF',
    secondaryContainerLight: '#DDE1F9',
    onSecondaryContainerLight: '#12183B',
    secondaryContainerDark: '#414659',
    onSecondaryContainerDark: '#DDE1F9',
  },
  {
    id: 'brown',
    label: 'Коричневый',
    swatch: '#6D4C41',
    primary: '#6F4F37',
    onPrimary: '#FFFFFF',
    primaryContainerLight: '#FBDEBC',
    onPrimaryContainerLight: '#271904',
    primaryContainerDark: '#563821',
    onPrimaryContainerDark: '#FBDEBC',
    secondaryContainerLight: '#ECE0DA',
    onSecondaryContainerLight: '#1F1B16',
    secondaryContainerDark: '#4A4541',
    onSecondaryContainerDark: '#ECE0DA',
  },
];

export const DEFAULT_PRIMARY_COLOR_ID = 'blue';

export function getPrimaryColorPreset(id: string): PrimaryColorPreset {
  return (
    PRIMARY_COLOR_PRESETS.find((preset) => preset.id === id) ??
    PRIMARY_COLOR_PRESETS.find((preset) => preset.id === DEFAULT_PRIMARY_COLOR_ID)!
  );
}