# Parallel MD5 Calculator | 并行 MD5 计算工具

![License](https://img.shields.io/badge/License-MIT-green.svg)

**ParallelMD5** 是一个基于现代浏览器特性的多线程哈希计算工具，通过 Web Worker 线程池技术实现高效的并行 MD5 计算。采用零拷贝内存传输和动态负载均衡策略，可加速大文件分片的批量哈希计算，相比传统单线程计算可获得 300%-500% 的性能提升。

**ParallelMD5** is a multi-threaded hash calculator leveraging modern browser features, utilizing Web Worker thread pool for efficient parallel MD5 computation. With zero-copy memory transfer and dynamic load balancing, it accelerates batch hash calculation of large file chunks, delivering 300%-500% performance improvement over traditional single-thread approaches.

## Features | 功能特性

-   🚀 Multi-threaded parallel computation | 多线程并行计算
-   🔥 Transferable Objects for zero-copy transfer | 零拷贝内存传输
-   📦 TypeScript ready | 开箱即用 TypeScript 支持

## Core Technologies | 核心技术

1. **Worker Pool Architecture**  
   线程池架构 (`WorkerPool`/`WorkerWrapper` 类实现)
2. **Memory Optimization**  
   内存优化 (通过 postMessage 的 Transferable 特性)
3. **Task Scheduling**  
   任务调度系统 (`BehaviorSubject` 驱动)
4. **Modular Design**  
   模块化设计 (WorkerLabelsEnum 消息协议)

## Dependencies | 依赖项

| Package      | 作用描述                |
| ------------ | ----------------------- |
| `spark-md5`  | MD5 计算核心库          |
| `rxjs`       | 响应式任务调度管理      |
| `typescript` | 类型系统支持 (开发依赖) |

## Usage | 使用指南

```TypeScript
import { WorkerService } from './workerService'

// 初始化服务 | Initialize service
const workerService = new WorkerService();

// 文件分片处理 | Split file to chunks
const fileChunks = await splitFileToBuffers(file);

// 并行计算MD5 | Compute MD5 in parallel
workerService.getMD5ForFiles(fileChunks)
  .then(results => {
    console.log('MD5 Results:', results);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```
