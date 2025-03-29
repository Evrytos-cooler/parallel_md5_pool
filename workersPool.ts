import { WorkerRep } from './workerMessage'
import { WorkerLabelsEnum } from './worker-labels.enum'
import { BehaviorSubject } from 'rxjs'

export enum StatusEnum {
	RUNNING = 'running',
	WAITING = 'waiting',
}

export class WorkerWrapper {
	worker: Worker
	status: StatusEnum

	constructor(worker: Worker) {
		this.worker = worker
		this.status = StatusEnum.WAITING
	}

	run<T>(param: ArrayBuffer, params: ArrayBuffer[], index: number) {
		this.status = StatusEnum.RUNNING
		return new Promise<T>((rs, rj) => {
			this.worker.onmessage = ({
				data,
			}: WorkerRep<{ result: string; chunk: ArrayBuffer }>) => {
				const { label, content } = data
				if (label === WorkerLabelsEnum.DONE && content) {
					params[index] = content.chunk // 归还分片的所有权
					this.status = StatusEnum.WAITING
					rs(content.result as T)
				}
			}
			this.worker.onerror = e => {
				this.status = StatusEnum.WAITING
				rj(e)
			}
			this.worker.postMessage(param, [param]) // 用于 transfer 的数据, 以避免结构化克隆
		})
	}
}

export abstract class WorkerPool {
	pool: WorkerWrapper[] = []
	maxWorkerCount: number
	curRunningCount = new BehaviorSubject(0)
	results: any[] = []

	protected constructor(maxWorkers = navigator.hardwareConcurrency || 4) {
		this.maxWorkerCount = maxWorkers
	}

	exec<T>(params: ArrayBuffer[]) {
		this.results.length = 0
		const workerParams = params.map((param, index) => ({ data: param, index }))

		return new Promise<T[]>(rs => {
			this.curRunningCount.subscribe(count => {
				if (count < this.maxWorkerCount && workerParams.length !== 0) {
					// 当前能跑的任务数量
					let curTaskCount = this.maxWorkerCount - count
					if (curTaskCount > params.length) {
						curTaskCount = params.length
					}

					// 此时可以用来执行任务的 Worker
					const canUseWorker: WorkerWrapper[] = []
					for (const worker of this.pool) {
						if (worker.status === StatusEnum.WAITING) {
							canUseWorker.push(worker)
							if (canUseWorker.length === curTaskCount) {
								break
							}
						}
					}

					const paramsToRun = workerParams.splice(0, curTaskCount)
					// 更新当前正在跑起来的 worker 数量

					this.curRunningCount.next(this.curRunningCount.value + curTaskCount)
					canUseWorker.forEach((workerApp, index) => {
						const param = paramsToRun[index]
						workerApp
							.run(param.data, params, param.index)
							.then(res => {
								this.results[param.index] = res
							})
							.catch(e => {
								this.results[param.index] = e
							})
							.finally(() => {
								this.curRunningCount.next(this.curRunningCount.value - 1)
							})
					})
				}

				if (this.curRunningCount.value === 0 && workerParams.length === 0) {
					rs(this.results as T[])
				}
			})
		})
	}

	//关闭线程池
	close() {
		this.pool.forEach(workerWrapper => workerWrapper.worker.terminate())
	}
}

export class WorkerPoolForMd5s extends WorkerPool {
	constructor(maxWorkers: number) {
		super(maxWorkers)
		this.pool = Array.from({ length: this.maxWorkerCount }).map(
			() =>
				new WorkerWrapper(
					new Worker(new URL('./md5crc32.worker.js', import.meta.url), {
						type: 'module',
					})
				)
		)
	}
}
