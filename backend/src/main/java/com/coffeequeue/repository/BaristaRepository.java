package com.coffeequeue.repository;

import com.coffeequeue.model.Barista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BaristaRepository extends JpaRepository<Barista, String> {
    List<Barista> findByStatus(String status);
    List<Barista> findAll();
    Optional<Barista> findById(String id);
}
