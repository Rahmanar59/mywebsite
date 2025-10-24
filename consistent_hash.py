"""
Consistent Hashing Implementation for Distributed Storage
This module provides a consistent hashing ring for distributing inventory across multiple nodes.
"""

import hashlib
import bisect
from typing import List, Tuple, Optional, Any


class ConsistentHashRing:
    """
    A consistent hashing ring implementation for distributed storage.
    Uses MD5 hash function to map nodes and keys to the ring.
    """
    
    def __init__(self, nodes: List[str] = None, replicas: int = 3):
        """
        Initialize the consistent hash ring.
        
        Args:
            nodes: List of node identifiers
            replicas: Number of virtual nodes per physical node
        """
        self.replicas = replicas
        self.ring = {}  # hash -> node mapping
        self.sorted_keys = []  # sorted list of hash values
        
        if nodes:
            for node in nodes:
                self.add_node(node)
    
    def _hash(self, key: str) -> int:
        """Generate MD5 hash for a given key."""
        return int(hashlib.md5(key.encode()).hexdigest(), 16)
    
    def add_node(self, node: str) -> None:
        """
        Add a node to the hash ring.
        Creates multiple virtual nodes for better distribution.
        """
        for i in range(self.replicas):
            virtual_node = f"{node}:{i}"
            hash_value = self._hash(virtual_node)
            self.ring[hash_value] = node
            bisect.insort(self.sorted_keys, hash_value)
    
    def remove_node(self, node: str) -> None:
        """
        Remove a node from the hash ring.
        Removes all virtual nodes associated with the physical node.
        """
        keys_to_remove = []
        for hash_value, node_name in self.ring.items():
            if node_name == node:
                keys_to_remove.append(hash_value)
        
        for hash_value in keys_to_remove:
            del self.ring[hash_value]
            self.sorted_keys.remove(hash_value)
    
    def get_node(self, key: str) -> Optional[str]:
        """
        Get the node responsible for a given key.
        Uses clockwise search on the ring.
        """
        if not self.ring:
            return None
        
        hash_value = self._hash(key)
        index = bisect.bisect_right(self.sorted_keys, hash_value)
        
        # Wrap around to the beginning if we're at the end
        if index == len(self.sorted_keys):
            index = 0
        
        return self.ring[self.sorted_keys[index]]
    
    def get_nodes(self, key: str, count: int = 1) -> List[str]:
        """
        Get multiple nodes responsible for a given key.
        Useful for replication scenarios.
        """
        if not self.ring or count <= 0:
            return []
        
        hash_value = self._hash(key)
        index = bisect.bisect_right(self.sorted_keys, hash_value)
        
        nodes = []
        seen_nodes = set()
        
        # Start from the primary node and collect unique nodes
        for i in range(len(self.sorted_keys)):
            current_index = (index + i) % len(self.sorted_keys)
            node = self.ring[self.sorted_keys[current_index]]
            
            if node not in seen_nodes:
                nodes.append(node)
                seen_nodes.add(node)
                
                if len(nodes) == count:
                    break
        
        return nodes
    
    def get_ring_info(self) -> dict:
        """Get information about the current state of the ring."""
        return {
            'total_virtual_nodes': len(self.ring),
            'physical_nodes': len(set(self.ring.values())),
            'replicas_per_node': self.replicas,
            'sorted_keys': self.sorted_keys[:10]  # Show first 10 for debugging
        }
