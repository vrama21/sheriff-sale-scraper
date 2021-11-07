export const getCountyId = (county: string) => {
  const countyIdMapping = {
    Atlantic: '25',
    Bergen: '7',
    Burlington: '3',
    Camden: '1',
    Cumberland: '6',
    Essex: '2',
    Gloucester: '19',
    Hudson: '10',
    Hunterdon: '32',
    Monmouth: '8',
    Morris: '9',
    Passaic: '19',
    Salem: '20',
    Union: '15',
  } as { [index: string]: string };

  return countyIdMapping[county];
};
