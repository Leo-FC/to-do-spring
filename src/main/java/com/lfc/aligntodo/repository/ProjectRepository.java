package com.lfc.aligntodo.repository;

import com.lfc.aligntodo.model.Project;
import com.lfc.aligntodo.model.projection.ProjectProjection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    public List<ProjectProjection> findByUser_Id(Long id);
}
