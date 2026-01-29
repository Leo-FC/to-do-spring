package com.lfc.aligntodo.model.projection;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.lfc.aligntodo.model.enums.TaskPriorityEnum;
import com.lfc.aligntodo.model.enums.TaskStatusEnum;
import org.springframework.beans.factory.annotation.Value;


import java.time.LocalDate;

public interface TaskProjection {

    public Long getId();

    public String getDescription();

    public TaskPriorityEnum getPriority();

    public TaskStatusEnum getStatus();

    @JsonFormat(pattern = "yyyy-MM-dd")
    public LocalDate getCreatedDate();

    @JsonFormat(pattern = "yyyy-MM-dd")
    public LocalDate getDeadline();

    @Value("#{target.project?.id}")
    Long getProjectId();

}
