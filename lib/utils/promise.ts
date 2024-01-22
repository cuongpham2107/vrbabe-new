"use client"
import useAlerts from "@/stores/alerts"

export const usePromise = async ({
  loading, setLoading, callback, successTitle = 'Thành công',
  showSuccessTitle = true, setError, always = false
}: {
  loading?: boolean,
  always?: boolean,
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>,
  setError?: React.Dispatch<React.SetStateAction<string>>,
  callback: () => Promise<void> | void,
  successTitle?: string,
  showSuccessTitle?: boolean
}) => {
  try {
    if (loading && !always) return
    if (typeof setLoading == "function")
      setLoading(true)

    await callback()
    
    if (showSuccessTitle) {
      useAlerts.getState().addAlert({type: 'success', message: successTitle})
    }
  } 
  catch (error) {
    let text = error instanceof Error ? error.message : "Có lỗi xảy ra, vui lòng thử lại sau"

    useAlerts.getState().addAlert({type: 'error', message: text})

    if (typeof setError == "function") {
      setError(text)
    }
  } 
  finally {
    if (typeof setLoading == "function") {
      setLoading(false)
    }
  }
}

type SuccessResult<T> = T & { error?: never }

export const useAction = async <T extends { error?: any }>(
  callback: () => Promise<T | undefined | void>
): Promise<SuccessResult<T>> => {
  const data = await callback()

  if (data?.error) {
    throw new Error(data.error)
  }

  return data as SuccessResult<T>
}