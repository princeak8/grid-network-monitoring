import api from './api';

export function getRocofs() {
    return api.get('/frequency/rocof_series').then(res => res.data);
}