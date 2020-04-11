import { createSelector } from '@ngrx/store';
import { AppState } from '../state/app.state';



export const selectFeature = ((state: AppState) => state);
