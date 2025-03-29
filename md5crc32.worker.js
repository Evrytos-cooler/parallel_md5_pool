import { WorkerMessage } from './workerMessage'
import { WorkerLabelsEnum } from './worker-labels.enum'
import SparkMD5 from 'spark-md5'
let arrBufs = []
let spark = new SparkMD5.ArrayBuffer()

/**
 * 以增量的方式计算单个大文件的 md5
 */
addEventListener('message', ({ data }) => {
	const { label, content } = data
	if (label === WorkerLabelsEnum.INIT) {
		arrBufs = spark = new SparkMD5.ArrayBuffer()
	}

	if (label === WorkerLabelsEnum.CHUNK) {
		arrBufs.push(content)
		spark.append(content)
	}

	if (label === WorkerLabelsEnum.DONE) {
		const hash = spark.end()
		arrBufs.forEach((chunk, index) => {
			postMessage(new WorkerMessage(WorkerLabelsEnum.CHUNK, { chunk, index }), [
				chunk,
			])
		})

		postMessage(new WorkerMessage(WorkerLabelsEnum.DONE, hash))
	}
})

addEventListener('message', ({ data }) => {
	const hash = SparkMD5.ArrayBuffer.hash(data)

	postMessage(
		new WorkerMessage(WorkerLabelsEnum.DONE, {
			result: hash,
			chunk: data,
		}),
		[data]
	)
})
