#!/usr/bin/env python
# coding: utf-8

# In[1]:


import numpy as np
import random
from collections import defaultdict
from scipy.sparse import csr_matrix
from sklearn.utils import shuffle
from sklearn.metrics import calinski_harabasz_score
from sklearn.cluster import BisectingKMeans
from sklearn.decomposition import TruncatedSVD


# In[2]:


def read_data(filename):
    data = []
    row = []
    col = []
    with open(filename, 'r') as f:
        for i, line in enumerate(f):
            line = line.strip().split()
            for j in range(0, len(line), 2):
                row.append(i)
                col.append(int(line[j]))
                data.append(float(line[j + 1]))
    return csr_matrix((data, (row, col)))


# In[3]:


csr_mat = read_data('train.dat')


# In[4]:


def csr_idf(matrix, copy=False, **kargs):
    """ Scale a CSR matrix by idf.
    Returns scaling factors as dict. If copy is True,
    returns scaled matrix and scaling factors.
    """
    if copy is True:
        matrix = matrix.copy()
    n_rows = matrix.shape[0]
    nnz = matrix.nnz
    ind, val, ptr = matrix.indices, matrix.data, matrix.indptr
    # document frequency
    df = defaultdict(int)
    for i in ind:
        df[i] += 1
    # inverse document frequency
    for k, v in df.items():
        df[k] = np.log(n_rows / float(v))
    # scale by idf
    for i in range(0, nnz):
        val[i] *= df[ind[i]]

    return df if copy is False else matrix


# In[5]:


idf_matrix = csr_idf(csr_mat, copy=True)


# In[6]:


print(idf_matrix.shape)


# In[7]:


def csr_l2_normalize(matrix, copy=False, **kargs):
    r""" Normalize a CSR matrix by its L-2 norm.
    Returns scaling factors as dict. If copy is True,
    returns scaled matrix and scaling factors.
    """
    if copy is True:
        matrix = matrix.copy()
    n_rows = matrix.shape[0]
    ind, val, ptr = matrix.indices, matrix.data, matrix.indptr
    # L-2 norm
    norm = defaultdict(float)
    for i in range(0, n_rows):
        for j in range(ptr[i], ptr[i + 1]):
            norm[i] += val[j] ** 2
        norm[i] = np.sqrt(norm[i])
    # scale by L-2 norm
    for i in range(0, n_rows):
        for j in range(ptr[i], ptr[i + 1]):
            val[j] /= norm[i]

    return norm if copy is False else matrix


# In[8]:


csr_l2_normalize_mat = csr_l2_normalize(idf_matrix, copy=True)


# In[9]:


dense_matrix = csr_l2_normalize_mat.toarray()


# In[10]:


print(dense_matrix.shape)


# In[11]:


svd2 = TruncatedSVD(n_components=1000)
train_reduced = svd2.fit_transform(dense_matrix)
print(train_reduced.shape)


# In[25]:


def convert_to_2d_array(points):
    points = np.array(points)
    if len(points.shape) == 1:
        points = np.expand_dims(points, -1)
    return points


# In[26]:


def SSE(points):
    """
    Calculates the sum of squared errors for the given list of data points.
    """
    points = convert_to_2d_array(points)
    centroid = np.mean(points, 0)
    errors = np.linalg.norm(points - centroid, ord=2, axis=1)
    return np.sum(errors)


# In[27]:


def kmeans(points, k=2, epochs=10, max_iter=100, verbose=False):
    """
    Clusters the list of points into `k` clusters using k-means clustering
    algorithm.
    """
    points = convert_to_2d_array(points)
    assert len(points) >= k, "Number of data points can't be less than k"
    best_sse = np.inf
    for ep in range(epochs):
        # Randomly initialize k centroids
        np.random.shuffle(points)
        centroids = points[0:k, :]
        last_sse = np.inf
        for it in range(max_iter):
            # Cluster assignment
            clusters = [None] * k
            for i, p in enumerate(points):
                if i % 1000 == 0:
                    print(i)
                index = np.argmin(np.linalg.norm(centroids - p, 2, 1))
                if clusters[index] is None:
                    clusters[index] = np.expand_dims(p, 0)
                else:
                    clusters[index] = np.vstack((clusters[index], p))  # Centroid update
            centroids = [np.mean(c, 0) for c in clusters]  # SSE calculation
            sse = np.sum([SSE(c) for c in clusters])
            gain = last_sse - sse
            if verbose:
                print((f'Epoch: {ep:3d}, Iter: {it:4d}, '
                       f'SSE: {sse:12.4f}, Gain: {gain:12.4f}'))  # Check for improvement
            if sse < best_sse:
                best_clusters, best_sse = clusters, sse  # Epoch termination condition
            if np.isclose(gain, 0, atol=0.00001):
                break
            last_sse = sse
    return best_clusters


# In[28]:


def bisecting_kmeans(points, k=2, epochs=1, max_iter=1, verbose=False):
    """
    Clusters the list of points into `k` clusters using bisecting k-means
    clustering algorithm. Internally, it uses the standard k-means with k=2 in
    each iteration.
    """
    original_points = points
    points = convert_to_2d_array(points)
    clusters = [points]
    while len(clusters) < k:
        print(f'Number of clusters: {len(clusters)}')
        max_sse_i = np.argmax([SSE(c) for c in clusters])
        cluster = clusters.pop(max_sse_i)
        two_clusters = kmeans(
            cluster, k=2, epochs=epochs, max_iter=max_iter, verbose=verbose)
        clusters.extend(two_clusters)
        
    return clusters


# In[31]:


print(train_reduced[0].shape)
clusters = bisecting_kmeans(train_reduced, k=7, verbose=True, epochs=1, max_iter=2)
print(clusters)


# In[36]:


print(clusters[0])


# In[37]:


original_points = train_reduced
labels = np.zeros(original_points.shape[0])
for i in range(len(clusters)):
    for j in range(len(clusters[i])):
        # find the actual point in the original list
        index = np.where((original_points == clusters[i][j]).all(axis=1))[0][0]
        labels[index] = i
print(labels)


# In[39]:


np.savetxt('labels.dat', labels, fmt='%d')


# In[ ]:




