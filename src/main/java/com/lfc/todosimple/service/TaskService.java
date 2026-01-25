package com.lfc.todosimple.service;

import com.lfc.todosimple.model.Task;
import com.lfc.todosimple.model.User;
import com.lfc.todosimple.model.enums.ProfileEnum;
import com.lfc.todosimple.model.projection.TaskProjection;
import com.lfc.todosimple.repository.TaskRepository;
import com.lfc.todosimple.security.UserSpringSecurity;
import com.lfc.todosimple.service.exceptions.AuthorizationException;
import com.lfc.todosimple.service.exceptions.DataBindingViolationException;
import com.lfc.todosimple.service.exceptions.ObjectNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserService userService;

    public Task findById(Long id){
        Task task = this.taskRepository.findById(id).orElseThrow(() -> new ObjectNotFoundException("Tarefa nao encontrada"));

        UserSpringSecurity userSpringSecurity = UserService.authenticated();

        if(Objects.isNull(userSpringSecurity) || !userSpringSecurity.hasRole(ProfileEnum.ADMIN) && !userHasTask(userSpringSecurity, task)){
            throw new AuthorizationException("Acesso negado");
        }

        return task;
    }

    public List<TaskProjection> findAllByUser(){

        UserSpringSecurity userSpringSecurity = UserService.authenticated();

        if(Objects.isNull(userSpringSecurity)){
            throw new AuthorizationException("Acesso negado");
        }

        List<TaskProjection> tasks = taskRepository.findByUser_Id(userSpringSecurity.getId());
        return tasks;
    }

    public List<Task> findAllByUserAdmin(){

        UserSpringSecurity userSpringSecurity = UserService.authenticated();

        if(Objects.isNull(userSpringSecurity) || !userSpringSecurity.hasRole(ProfileEnum.ADMIN)){
            throw new AuthorizationException("Acesso negado");
        }

        List<Task> tasks = taskRepository.findAllByOrderByUser_IdAsc();
        return tasks;
    }


    @Transactional
    public Task create(Task obj){

        UserSpringSecurity userSpringSecurity = UserService.authenticated();

        if(Objects.isNull(userSpringSecurity)){
            throw new AuthorizationException("Acesso negado");
        }

        if(obj.getCreatedDate() == null){
            obj.setCreatedDate(LocalDate.now());
        }

        if(obj.getDeadline() != null && obj.getDeadline().isBefore(obj.getCreatedDate())){
            throw new DataBindingViolationException("A data de entrega não pode ser anterior a data de criação.");
        }

        User user = this.userService.findById(userSpringSecurity.getId());
        obj.setId(null);
        obj.setUser(user);
        obj = this.taskRepository.save(obj);
        return obj;
    }

    @Transactional
    public Task update(Task obj){
        Task newObj = findById(obj.getId());

        newObj.setDescription(obj.getDescription());
        newObj.setPriority(obj.getPriority());
        newObj.setStatus(obj.getStatus());

        if(obj.getCreatedDate() != null) {
            newObj.setCreatedDate(obj.getCreatedDate());
        }

        newObj.setDeadline(obj.getDeadline());

        if (newObj.getDeadline() != null && newObj.getDeadline().isBefore(newObj.getCreatedDate())) {
            throw new DataBindingViolationException("A data de entrega não pode ser anterior à data de criação.");
        }

        return this.taskRepository.save(newObj);
    }

    public void delete(Long id){
        findById(id);

        try{
            this.taskRepository.deleteById(id);
        }catch(Exception e){
            throw new DataBindingViolationException("Nao e possivel excluir pois ha entidades relacionadas");
        }
    }

    private Boolean userHasTask(UserSpringSecurity userSpringSecurity, Task task){
        return task.getUser().getId().equals(userSpringSecurity.getId());
    }
}
