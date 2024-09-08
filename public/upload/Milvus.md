# Milvus Guildline

## What is Milvus?

> Everything you need to know about Milvus in less than 10 minutes.

## What are vector embeddings?

Vector embeddings are numerical representations derived from machine learning models, encapsulating the semantic meaning of unstructured data. These embeddings are generated through the analysis of complex correlations within data by neural networks or transformer architectures, creating a dense vector space where each point corresponds to the "meaning" of data objects, such as words in a document.

This process transforms textual or other unstructured data into vectors that reflect semantic similarities—words with related meanings are positioned closer together in this multi-dimensional space, facilitating a type of search known as "dense vector search." This contrasts with traditional keyword search, which relies on exact matches and uses sparse vectors. The development of vector embeddings, often stemming from foundational models trained extensively by major tech firms, allows for more nuanced searches that capture the essence of the data, moving beyond the limitations of lexical or sparse vector search methods.

## What can I use vector embeddings for?

Vector embeddings can be utilized across various applications, enhancing efficiency and accuracy in various ways. Here are some of the most frequent use cases:

**Finding Similar Images, Videos, or Audio Files**
Vector embeddings enable searching for similar multimedia content by content rather than just keywords, using Convolutional Neural Networks (CNNs) to analyze images, video frames, or audio segments. This allows for advanced searches, like finding images based on sound cues or videos through image queries, by comparing the embedded representations stored in vector databases.

**Accelerating Drug Discovery**
In the pharmaceutical industry, vector embeddings can encode chemical structures of compounds, facilitating the identification of promising drug candidates by measuring their similarity to target proteins. This accelerates the drug discovery process, saving time and resources by focusing on the most viable leads.

**Boosting Search Relevance with Semantic Search**
By embedding internal documents into vectors, organizations can leverage semantic search to improve the relevance of search results. This method uses the concept of Retrieval Augmented Generation (RAG) to understand the intent behind queries, providing answers from a company's data through AI models like ChatGPT, thereby reducing irrelevant results and AI hallucinations.

**Recommender Systems**
Vector embeddings revolutionize recommender systems by representing users and items as embeddings to measure similarity. This approach enables personalized recommendations based on individual preferences, enhancing user satisfaction and engagement with online platforms.

**Anomaly Detection**
In fields such as fraud detection, network security, and industrial monitoring, vector embeddings are instrumental in identifying unusual patterns. Data points represented as embeddings allow for detecting anomalies by calculating distances or dissimilarities, facilitating early identification and preventive measures against potential issues.

## How does Milvus differentiate from other vector databases?

Milvus stands out as a vector database with its scalable architecture and diverse capabilities designed to accelerate and unify search experiences across various applications. The key feature highlights are:

**Scalable and Elastic Architecture**
Milvus is engineered for exceptional scalability and elasticity, accommodating the dynamic demands of modern applications. It achieves this through service-oriented design, decoupling storage, coordinators, and workers, allowing for component-wise scaling. This modular approach ensures that different computational tasks can scale independently according to varying workloads, providing fine-grained resource allocation and isolation.

**Diverse Index Support**
Milvus supports an extensive array of over 10 index types, including widely-used ones such as HNSW, IVF, Product Quantization, and GPU-based indexing. This variety empowers developers to optimize searches according to specific performance and accuracy requirements, ensuring that the database can adapt to a wide range of applications and data characteristics. Continuous expansion of its index offerings, e.g. GPU index, further enhances Milvus's adaptability and effectiveness in handling complex search tasks.

**Versatile Search Capabilities**
Milvus offers a wide range of search types, including top-K Approximate Nearest Neighbor (ANN), Range ANN, and search with metadata filtering, and upcoming hybrid dense and sparse vector search. This diversity enables unmatched query flexibility and precision, granting developers the ability to customize data retrieval strategies to meet specific application demands, thereby optimizing both the relevance and efficiency of search results.

**Tunable Consistency**
Milvus offers a delta consistency model that allows users to specify a "staleness tolerance" for query data, enabling a tailored balance between query performance and data freshness. This flexibility is crucial for applications requiring up-to-date results without sacrificing response times, effectively supporting both strong and eventual consistency as per application needs.

**Hardware-Accelerated Compute Support**
Milvus is designed to leverage various types of compute capabilities, such as AVX512 and Neon for SIMD execution, alongside quantization, cache-aware optimizations, and GPU support. This approach enables efficient utilization of specific hardware strengths, ensuring rapid processing and cost-effective scalability. By tailoring resource use to the unique demands of different applications, Milvus enhances both the speed and efficiency of vector data management and search operations.
