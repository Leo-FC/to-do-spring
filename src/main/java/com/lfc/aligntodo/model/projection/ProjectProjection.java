package com.lfc.aligntodo.model.projection;

import java.util.List;

public interface ProjectProjection {

    public Long getId();
    public String getName();
    public String getDescription();
    public List<TaskProjection> getTasks();
}
