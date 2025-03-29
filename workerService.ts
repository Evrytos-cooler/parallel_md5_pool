import { WorkerLabelsEnum } from "./worker-labels.enum";
import { WorkerMessage } from "./workerMessage";
import { WorkerPoolForMd5s } from "./workersPool";

export class WorkerService {
    // 可以根据 CPU 核心数调整
    readonly MAX_WORKERS = 8;

    md5MultipleWorker: Worker | undefined;
    md5SingleWorkerPool: WorkerPoolForMd5s | undefined;

    /**
     * 直接计算文件的 MD5
     * @param chunks 将每个 chunk 视作独立的文件
     */
    getMD5ForFiles(chunks: ArrayBuffer[]) {
        if (this.md5SingleWorkerPool === undefined) {
            this.md5SingleWorkerPool = new WorkerPoolForMd5s(this.MAX_WORKERS);
        }
        return this.md5SingleWorkerPool.exec<string>(chunks);
    }
}
