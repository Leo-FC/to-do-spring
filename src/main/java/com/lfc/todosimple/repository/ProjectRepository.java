package com.lfc.todosimple.repository;

import com.lfc.todosimple.model.Project;
import com.lfc.todosimple.model.projection.ProjectProjection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    public List<ProjectProjection> findByUser_Id(Long id);
}
