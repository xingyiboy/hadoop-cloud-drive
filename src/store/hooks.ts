/**
 * 预类型钩子
 * 组件文件调用该钩子
 * 无需再使用标准的 useDispatch useSelector
 */

import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from './index'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
