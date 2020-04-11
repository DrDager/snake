import { ActionReducerMap } from '@ngrx/store';
import { MetaReducer } from '@ngrx/store';

import { AppState } from '../state/app.state';
import { environment } from '../../../environments/environment';

export const appReducers: ActionReducerMap<AppState, any> = {
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : [];
