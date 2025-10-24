"""
Hash Table Implementation with Quadratic Probing
This module provides a hash table that uses quadratic probing for collision resolution.
"""

from typing import Any, Optional, Tuple
import math


class HashTable:
    """
    A hash table implementation using quadratic probing for collision resolution.
    Supports dynamic resizing to maintain good performance.
    """
    
    def __init__(self, initial_capacity: int = 16, load_factor: float = 0.75):
        """
        Initialize the hash table.
        
        Args:
            initial_capacity: Initial size of the hash table
            load_factor: Maximum load factor before resizing (0.0 to 1.0)
        """
        self.capacity = initial_capacity
        self.load_factor = load_factor
        self.size = 0
        self.table = [None] * self.capacity
        self.deleted_marker = object()  # Special marker for deleted entries
    
    def _hash(self, key: str) -> int:
        """Generate hash value for a given key using polynomial rolling hash."""
        hash_value = 0
        prime = 31
        
        for char in key:
            hash_value = (hash_value * prime + ord(char)) % self.capacity
        
        return hash_value
    
    def _is_prime(self, n: int) -> bool:
        """Check if a number is prime."""
        if n < 2:
            return False
        if n == 2:
            return True
        if n % 2 == 0:
            return False
        
        for i in range(3, int(math.sqrt(n)) + 1, 2):
            if n % i == 0:
                return False
        return True
    
    def _next_prime(self, n: int) -> int:
        """Find the next prime number greater than n."""
        if n <= 2:
            return 2
        
        candidate = n + 1
        if candidate % 2 == 0:
            candidate += 1
        
        while not self._is_prime(candidate):
            candidate += 2
        
        return candidate
    
    def _resize(self) -> None:
        """Resize the hash table when load factor is exceeded."""
        old_table = self.table
        old_capacity = self.capacity
        
        # Double the capacity and find next prime
        self.capacity = self._next_prime(old_capacity * 2)
        self.table = [None] * self.capacity
        self.size = 0
        
        # Rehash all existing entries
        for entry in old_table:
            if entry is not None and entry is not self.deleted_marker:
                key, value = entry
                self.put(key, value)
    
    def _find_slot(self, key: str) -> Tuple[int, bool]:
        """
        Find the slot for a key using quadratic probing.
        Returns (index, found) tuple where found indicates if key exists.
        """
        hash_value = self._hash(key)
        index = hash_value
        i = 0
        
        while i < self.capacity:
            entry = self.table[index]
            
            if entry is None:
                return (index, False)
            elif entry is not self.deleted_marker:
                existing_key, _ = entry
                if existing_key == key:
                    return (index, True)
            
            # Quadratic probing: i^2
            i += 1
            index = (hash_value + i * i) % self.capacity
        
        # Table is full (should not happen with proper resizing)
        raise RuntimeError("Hash table is full and cannot find a slot")
    
    def put(self, key: str, value: Any) -> None:
        """
        Insert or update a key-value pair in the hash table.
        
        Args:
            key: The key to insert/update
            value: The value to associate with the key
        """
        # Check if we need to resize
        if self.size >= self.capacity * self.load_factor:
            self._resize()
        
        index, found = self._find_slot(key)
        
        if not found:
            self.size += 1
        
        self.table[index] = (key, value)
    
    def get(self, key: str) -> Optional[Any]:
        """
        Retrieve the value associated with a key.
        
        Args:
            key: The key to look up
            
        Returns:
            The value associated with the key, or None if not found
        """
        index, found = self._find_slot(key)
        
        if found:
            _, value = self.table[index]
            return value
        
        return None
    
    def delete(self, key: str) -> bool:
        """
        Delete a key-value pair from the hash table.
        
        Args:
            key: The key to delete
            
        Returns:
            True if the key was found and deleted, False otherwise
        """
        index, found = self._find_slot(key)
        
        if found:
            self.table[index] = self.deleted_marker
            self.size -= 1
            return True
        
        return False
    
    def contains(self, key: str) -> bool:
        """
        Check if a key exists in the hash table.
        
        Args:
            key: The key to check
            
        Returns:
            True if the key exists, False otherwise
        """
        _, found = self._find_slot(key)
        return found
    
    def keys(self) -> list:
        """Get all keys in the hash table."""
        result = []
        for entry in self.table:
            if entry is not None and entry is not self.deleted_marker:
                key, _ = entry
                result.append(key)
        return result
    
    def values(self) -> list:
        """Get all values in the hash table."""
        result = []
        for entry in self.table:
            if entry is not None and entry is not self.deleted_marker:
                _, value = entry
                result.append(value)
        return result
    
    def items(self) -> list:
        """Get all key-value pairs in the hash table."""
        result = []
        for entry in self.table:
            if entry is not None and entry is not self.deleted_marker:
                result.append(entry)
        return result
    
    def get_stats(self) -> dict:
        """Get statistics about the hash table."""
        return {
            'size': self.size,
            'capacity': self.capacity,
            'load_factor': self.size / self.capacity if self.capacity > 0 else 0,
            'max_load_factor': self.load_factor,
            'empty_slots': self.capacity - self.size
        }
