package com.lfc.todosimple.model.projection;

import java.util.List;

public interface ProjectProjection {

    public Long getId();
    public String getName();
    public String getDescription();
    public List<TaskProjection> getTasks();
}
