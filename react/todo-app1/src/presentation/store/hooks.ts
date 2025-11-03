import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// TypeScriptの型推論を強化したカスタムフック
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
