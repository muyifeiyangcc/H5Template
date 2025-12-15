export interface UseVideoCoverReturn {
  extractCoverFromVideo: (file: File) => Promise<Blob | null>
  isExtracting: Ref<boolean>
  error: Ref<string | null>
}

export function useVideoCover(): UseVideoCoverReturn {
  const isExtracting = ref(true)
  const error = ref<string | null>(null)

  const extractCoverFromVideo = (file: File): Promise<Blob | null> => {
    return new Promise(resolve => {
      if (!file || !file.type.startsWith('video/')) {
        error.value = '文件不是有效的视频'
        resolve(null)
        return
      }

      isExtracting.value = true
      error.value = null

      // ✅ 关键修复1：创建临时挂载容器
      const tempContainer = document.createElement('div')
      tempContainer.style.display = 'none'
      document.body.appendChild(tempContainer)

      const video = document.createElement('video')
      video.muted = true
      video.playsInline = true
      video.setAttribute('playsinline', 'true')
      video.setAttribute('webkit-playsinline', 'true')
      tempContainer.appendChild(video)

      // ✅ 关键修复2：用 FileReader 转为 data: URL（解决 iOS 17+ blob 问题）
      const fileReader = new FileReader()
      fileReader.readAsDataURL(file)
      fileReader.onload = () => {
        video.src = fileReader.result as string

        const cleanup = () => {
          if (tempContainer.parentNode) {
            tempContainer.parentNode.removeChild(tempContainer)
          }
          video.remove()
        }

        video.onerror = () => {
          error.value = `视频加载失败: ${video.error?.message || '未知错误'}`
          cleanup()
          isExtracting.value = false
          resolve(null)
        }

        video.onloadedmetadata = () => {
          console.log('视频元数据加载成功', video.duration)
          // 处理短视频（iOS 17+ 修复）
          if (video.duration < 1) {
            video.currentTime = video.duration - 0.1
          } else {
            video.currentTime = 1
          }
        }

        video.onseeked = () => {
          const canvas = document.createElement('canvas')
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight

          if (canvas.width === 0 || canvas.height === 0) {
            error.value = '无法获取视频尺寸'
            cleanup()
            isExtracting.value = false
            resolve(null)
            return
          }

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            error.value = 'Canvas 上下文不可用'
            cleanup()
            isExtracting.value = false
            resolve(null)
            return
          }

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          canvas.toBlob(
            blob => {
              cleanup()
              isExtracting.value = false
              resolve(blob || null)
            },
            'image/jpeg',
            0.8
          )
        }
      }
    })
  }

  return {
    extractCoverFromVideo,
    isExtracting,
    error
  }
}