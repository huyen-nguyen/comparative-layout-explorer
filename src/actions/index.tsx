import {CompareCase} from 'src/models/dataset';

export type Action = CompCasesLoad | CompCasesImageDataLoad;

export const COMP_CASES_LOAD = 'COMP_CASES_LOAD';
export type CompCasesLoad = {
  type: typeof COMP_CASES_LOAD;
  payload: CompareCase[];
}

export function loadCompCases(action: any): CompCasesLoad {
  return {
    type: COMP_CASES_LOAD,
    payload: action.payload
  }
}

export const COMP_CASES_IMAGE_DATA_LOAD = 'COMP_CASES_IMAGE_DATA_LOAD';
export type CompCasesImageDataLoad = {
  type: typeof COMP_CASES_IMAGE_DATA_LOAD;
  payload: {
    index: number, pairIndex: string, imgData: number[]
  }
}

export function onCompCaseImgDataLoad(action: any): CompCasesImageDataLoad {
  return {
    type: COMP_CASES_IMAGE_DATA_LOAD,
    payload: action.payload
  }
}