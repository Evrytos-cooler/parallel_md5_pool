// WorkerMessage.ts
import { WorkerLabelsEnum } from './worker-labels.enum'

export class WorkerMessage<T = any> {
	label: WorkerLabelsEnum
	content?: T

	constructor(label: WorkerLabelsEnum, content?: T) {
		this.label = label
		this.content = content
	}
}

//用泛型进一步封装workerMessage
export interface WorkerRep<T = any> {
	data: WorkerMessage<T>
}
