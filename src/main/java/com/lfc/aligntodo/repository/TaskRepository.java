package com.lfc.aligntodo.repository;

import java.util.List;

import com.lfc.aligntodo.model.Task;
import com.lfc.aligntodo.model.projection.TaskProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task,Long> {

    List<TaskProjection> findByUser_Id(Long id);

    List<Task> findAllByOrderByUser_IdAsc();
//    @Query(value = "SELECT t FROM Task t WHERE t.user.id = :id")
//    List<Task> findByUserId(@Param {"id"} Long id);

//    @Query(value = "SELECT * FROM task t WHERE t.user_id = :id", nativeQuery = true)
//    List<Task> findByUserId(@Param {"id"} Long id);

}
