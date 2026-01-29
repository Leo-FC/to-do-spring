package com.lfc.aligntodo.model.converter;

import com.lfc.aligntodo.model.enums.TaskStatusEnum;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

@Converter(autoApply = true)
public class TaskStatusConverter implements AttributeConverter<TaskStatusEnum, Integer> {

    @Override
    public Integer convertToDatabaseColumn(TaskStatusEnum status) {
        if (status == null) {
            return null;
        }
        return status.getCode();
    }

    @Override
    public TaskStatusEnum convertToEntityAttribute(Integer code) {
        if (code == null) {
            return null;
        }
        return TaskStatusEnum.toEnum(code);
    }
}
