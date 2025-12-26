package com.desk.repository;

import com.desk.domain.Ticket;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;


public interface TicketRepository extends JpaRepository<Ticket, Long>, TicketSearch  {
    Optional<Ticket> findByTnoAndWriter_Email(Long tno, String email);

    @EntityGraph(attributePaths = "documentList")
    @Query("select p from Ticket p where p.tno = :tno")
    Optional<Ticket> selectOne(@Param("tno") Long tno);
}
