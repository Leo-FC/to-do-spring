package com.lfc.todosimple.model.projection;

import com.lfc.todosimple.model.enums.TaskPriorityEnum;
import com.lfc.todosimple.model.enums.TaskStatusEnum;

import java.time.LocalDate;

public interface TaskProjection {

    public Long getId();

    public String getDescription();

    public TaskPriorityEnum getPriority();

    public TaskStatusEnum getStatus();

    public LocalDate getCreatedDate();

    public LocalDate getDeadline();
}
