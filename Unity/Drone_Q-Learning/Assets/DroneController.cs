using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class DroneController : MonoBehaviour {
    public GameObject front_left_motor;
    public GameObject front_right_motor;
    public GameObject back_left_motor;
    public GameObject back_right_motor;
    public GameObject body;
    public Rigidbody drone_body;

    public float throttle_front_left = 0f;
    public float throttle_front_right = 0f;
    public float throttle_back_left = 0f;
    public float throttle_back_right = 0f;

    public float LEARNING_RATE = 0.1f;
    public float DISCOUNT = 0.95f;
    public int EPISODES = 1000;
    public float epsilon = 0.5f;
    public int START_EPSILONE_DECAYING = 1;

    private List<int> observation_space_high = new List<int>() { 50, 50, 50, 50 };

    private List<int> observation_space_low = new List<int>() { -50, -50, -50, -50 };

    private int action_space_n = 8;
    private float episode_reward = 0.0f;

    private int episode = 0;
    public int q_table_size = 30;
    private int END_EPSILONE_DECAYING;
    private int epsilon_decay_value;
    private List<float> inputs = new List<float>();
    private List<float> new_inputs = new List<float>();

    private List<int> DESCRETE_OS_SIZE = new List<int>();
    private List<float> descrete_os_win_size = new List<float>();

    public float min_reward = -300.0f;
    public float max_reward = 40.0f;
    private List <int> discrete_state = new List<int>();
    private float reward = 0.0f;
    private float variance = 0.0f;
    private Vector3 drone_body_original_pos;
    private Vector3 front_left_motor_original_pos;
    private Vector3 front_right_motor_original_pos;
    private Vector3 back_left_motor_original_pos;
    private Vector3 back_right_motor_original_pos;
    private Vector3 body_original_pos;
    public float epoch_time = 5.0f;
    private float epoch_time_copy;
    private List<List<List<List<List<float>>>>> q_table;
    private List<List<List<List<List<float>>>>> q_table_copy;
    private int action;
    private List<int> new_discrete_state = new List<int>();
    private float max_future_q;
    private float current_q;
    private float new_q;
    private int test = 0;

    // Use this for initialization
    void Start() {
        epoch_time_copy = epoch_time;

        drone_body_original_pos = drone_body.transform.position;
      
        END_EPSILONE_DECAYING = (int)Mathf.Ceil(EPISODES / 2);
        epsilon_decay_value = (int)epsilon / (END_EPSILONE_DECAYING - START_EPSILONE_DECAYING);

        inputs.Add(throttle_front_left);
        inputs.Add(throttle_front_right);
        inputs.Add(throttle_back_left);
        inputs.Add(throttle_back_right);

        new_inputs.Add(0.0f);
        new_inputs.Add(0.0f);
        new_inputs.Add(0.0f);
        new_inputs.Add(0.0f);

        for (int i = 0; i < inputs.Count; i++)
        {
            DESCRETE_OS_SIZE.Add(q_table_size);
        }

        for (int i = 0; i < inputs.Count; i++)
        {
            descrete_os_win_size.Add((float)(observation_space_high[i] - observation_space_low[i]) / DESCRETE_OS_SIZE[i]);
          
        }

        List < List <List<List<float>>>> dim1 = new List<List<List<List<float>>>> ();
        List < List <List<float>>> dim2 = new List<List<List<float>>> ();
        List < List<float>> dim3 = new List<List<float>>();
        List<float> dim4 = new List<float>();

        q_table = new List<List<List<List<List<float>>>>>(DESCRETE_OS_SIZE[0]);

        for (int a = 0; a < DESCRETE_OS_SIZE[0]; a++)
        {
            q_table.Add(dim1);
        }

        for (int a = 0; a < DESCRETE_OS_SIZE[0]; a++)
        {
            q_table[a] = new List<List<List<List<float>>>>(DESCRETE_OS_SIZE[0]);
            for (int i = 0; i < DESCRETE_OS_SIZE[0]; i++)
            {
                q_table[a].Add(dim2);
            }
       
            for (int b = 0; b < DESCRETE_OS_SIZE[0]; b++)
            {
                q_table[a][b] = new List<List<List<float>>>(DESCRETE_OS_SIZE[0]);
                for (int i = 0; i < DESCRETE_OS_SIZE[0]; i++)
                {
                    q_table[a][b].Add(dim3);
                }
                
                for (int c = 0; c < DESCRETE_OS_SIZE[0]; c++)
                {
                    q_table[a][b][c] = new List<List<float>>(DESCRETE_OS_SIZE[0]);
                    for (int i = 0; i < DESCRETE_OS_SIZE[0]; i++)
                    {
                        q_table[a][b][c].Add(dim4);
                    }
                   
                    for (int d = 0; d < DESCRETE_OS_SIZE[0]; d++)
                    {
                        q_table[a][b][c][d] = new List<float>(action_space_n);
                        for (int i = 0; i < action_space_n; i++)
                        {
                            q_table[a][b][c][d].Add(Random.Range(min_reward, max_reward));
                        }
                    }
                }
            }
        }
             
        discrete_state = get_discrete_state(inputs, descrete_os_win_size, observation_space_low);
    }

    // Update is called once per frame
    void Update () {
        // rotate the propellers
        if (throttle_front_left > 0)
        {
            front_left_motor.transform.Rotate(-Vector3.back * (throttle_front_left));
        }
        if (throttle_front_right > 0)
        {
            front_right_motor.transform.Rotate(Vector3.back * (throttle_front_right));
        }
        if (throttle_back_left > 0)
        {
            back_left_motor.transform.Rotate(Vector3.back * (throttle_back_left));
        }
        if (throttle_back_right > 0)
        {
            back_right_motor.transform.Rotate(-Vector3.back * (throttle_back_right));
        }

        epoch_time -= Time.deltaTime;
        if (epoch_time < 0)
        {
            epoch_time = epoch_time_copy;

            if ((END_EPSILONE_DECAYING >= episode) && (episode >= START_EPSILONE_DECAYING))
            {
                epsilon = epsilon - epsilon_decay_value;
            }

            q_table_copy = q_table;
            Debug.Log("episode: " + episode);
            Debug.Log("episode reward: " + episode_reward);
            reset();
            episode_reward = 0.0f;
            discrete_state = get_discrete_state(inputs, descrete_os_win_size, observation_space_low);
            episode += 1;
        }
        else
        {
            if (Random.value > epsilon)
            {
                action = max_index(q_table[discrete_state[0]][discrete_state[1]][discrete_state[2]][discrete_state[3]]);
            }
            else
            {
                action = Random.Range(0, action_space_n);
            }

            if (action == 0)
            {
                throttle_front_left = calculate_throttle(throttle_front_left);
            }
            else if (action == 1)
            {
                throttle_front_right = calculate_throttle(throttle_front_right);
            }
            else if (action == 2)
            {
                throttle_back_right = calculate_throttle(throttle_back_right);
            }
            else if (action == 3)
            {
                throttle_back_left = calculate_throttle(throttle_back_left);
            }
            else if (action == 4)
            {
                throttle_front_right = calculate_throttle_back(throttle_front_right);
            }
            else if (action == 5)
            {
                throttle_back_right = calculate_throttle_back(throttle_back_right);
            }
            else if (action == 6)
            {
                throttle_back_left = calculate_throttle_back(throttle_back_left);
            }
            else if (action == 7)
            {
                throttle_front_left = calculate_throttle_back(throttle_front_left);
            }

            apply_thrust(throttle_front_left, throttle_front_right, throttle_back_left, throttle_back_right);

            float mean = (front_left_motor.transform.position.y + front_right_motor.transform.position.y + back_left_motor.transform.position.y + back_right_motor.transform.position.y) / 4;
            variance = Mathf.Sqrt((Mathf.Pow(front_left_motor.transform.position.y - mean, 2) + Mathf.Pow(front_right_motor.transform.position.y - mean, 2) + Mathf.Pow(back_left_motor.transform.position.y - mean, 2) + Mathf.Pow(back_right_motor.transform.position.y - mean, 2)) / (4 - 1));

            new_inputs[0] = throttle_front_left;
            new_inputs[1] = throttle_front_right;
            new_inputs[2] = throttle_back_left;
            new_inputs[3] = throttle_back_right;

            if (drone_body.transform.position.y > 1)
            {
                reward = drone_body.transform.position.y*5;
            }
            else
            {
                reward = drone_body.transform.position.y - 1;
            }

            // Flip over

            if ((this.transform.eulerAngles.x % 360) < 330 && (this.transform.eulerAngles.x % 360) > -330 && (this.transform.eulerAngles.y % 360) < 330 && (this.transform.eulerAngles.y % 360) > -330 && (this.transform.eulerAngles.z % 360) < 330 && (this.transform.eulerAngles.z % 360) > -330)
            {
                if ((this.transform.eulerAngles.z % 360) > 150 || (this.transform.eulerAngles.z % 360) < -150 || (this.transform.eulerAngles.x % 360) > 150 || (this.transform.eulerAngles.x % 360) < -150)
                {
                    reward -= 50;
                    test = 1;
                }
            }

            // Too high or too low or not on the plane
            if (drone_body.transform.position.y > 10 || drone_body.transform.position.y < 0 || drone_body.transform.position.z < -4 || drone_body.transform.position.z > 4 || drone_body.transform.position.x < -4 || drone_body.transform.position.x > 4)
            {
                reward -= 50;
                test = 1;
            }

            // Not stable movements
            if (variance > 0.2)
            {
                reward -= variance;
            }

            episode_reward = episode_reward + reward;

            new_discrete_state = get_discrete_state(new_inputs, descrete_os_win_size, observation_space_low);

            max_future_q = max_value(q_table[new_discrete_state[0]][new_discrete_state[1]][new_discrete_state[2]][new_discrete_state[3]]);
            current_q = q_table[discrete_state[0]][discrete_state[1]][discrete_state[2]][discrete_state[3]][action];
            new_q = (1 - LEARNING_RATE) * current_q + LEARNING_RATE * (reward + DISCOUNT * max_future_q);
            q_table[discrete_state[0]][discrete_state[1]][discrete_state[2]][discrete_state[3]][action] = new_q;

            discrete_state = new_discrete_state;

            if (test == 1)
            {
                reset();
            }
        }
    }

    public void reset()
    {
        Debug.Log("reset");
        Vector3 angle = new Vector3(0, 0, 0);
        this.transform.eulerAngles = angle;
        
        throttle_front_left = 0.0f;
        throttle_front_right = 0.0f;
        throttle_back_left = 0.0f;
        throttle_back_right = 0.0f;
        test = 0;
        reward = 0;

        this.transform.position = drone_body_original_pos;        
    }

    public float calculate_throttle(float throttle)
    {
        throttle += 1f;
        throttle = Mathf.Clamp(throttle, 0f, 50f);
        return throttle;
    }
    public float calculate_throttle_back(float throttle)
    {
        throttle -= 0.1f;
        throttle = Mathf.Clamp(throttle, -throttle, 0f);
        return throttle;
    }


    void apply_thrust(float throttle_front_left, float throttle_front_right, float throttle_back_left, float throttle_back_right)
    {
        
        drone_body.AddForceAtPosition(Vector3.up * throttle_front_left, front_left_motor.transform.position);
        drone_body.AddForceAtPosition(Vector3.up * throttle_front_right, front_right_motor.transform.position);
        drone_body.AddForceAtPosition(Vector3.up * throttle_back_left, back_left_motor.transform.position);
        drone_body.AddForceAtPosition(Vector3.up * throttle_back_right, back_right_motor.transform.position);
        

        if (this.transform.eulerAngles.y % 360 < 0)
        {
            if ((this.transform.eulerAngles.y % 360) <= -0.0 && (this.transform.eulerAngles.y % 360) > -90.0)
            {
                drone_body.AddForceAtPosition(Vector3.right * (throttle_front_left / 2), front_left_motor.transform.position);
                drone_body.AddForceAtPosition(Vector3.left * (throttle_front_right / 2), front_right_motor.transform.position);

                drone_body.AddForceAtPosition(Vector3.right * (throttle_back_left / 2), back_left_motor.transform.position);
                drone_body.AddForceAtPosition(Vector3.left * (throttle_back_right / 2), back_right_motor.transform.position);

            }
            else if ((this.transform.eulerAngles.y % 360) <= -90.0 && (this.transform.eulerAngles.y % 360) > -180.0)
            {
                drone_body.AddForceAtPosition(Vector3.right * (throttle_front_left / 2), front_left_motor.transform.position);
                drone_body.AddForceAtPosition(Vector3.right * (throttle_front_right / 2), front_right_motor.transform.position);

                drone_body.AddForceAtPosition(Vector3.left * (throttle_back_left / 2), back_left_motor.transform.position);
                drone_body.AddForceAtPosition(Vector3.left * (throttle_back_right / 2), back_right_motor.transform.position);
            }
            else if ((this.transform.eulerAngles.y % 360) <= -180.0 && (this.transform.eulerAngles.y % 360) > -270.0)
            {
                drone_body.AddForceAtPosition(Vector3.left * (throttle_front_left / 2), front_left_motor.transform.position);
                drone_body.AddForceAtPosition(Vector3.right * (throttle_front_right / 2), front_right_motor.transform.position);

                drone_body.AddForceAtPosition(Vector3.left * (throttle_back_left / 2), back_left_motor.transform.position);
                drone_body.AddForceAtPosition(Vector3.right * (throttle_back_right / 2), back_right_motor.transform.position);
            }

            else if ((this.transform.eulerAngles.y % 360) <= -270.0)
            {
                drone_body.AddForceAtPosition(Vector3.left * (throttle_front_left / 2), front_left_motor.transform.position);
                drone_body.AddForceAtPosition(Vector3.left * (throttle_front_right / 2), front_right_motor.transform.position);

                drone_body.AddForceAtPosition(Vector3.right * (throttle_back_left / 2), back_left_motor.transform.position);
                drone_body.AddForceAtPosition(Vector3.right * (throttle_back_right / 2), back_right_motor.transform.position);
            }

        }

        if (this.transform.eulerAngles.y > 0)
        {
            if ((this.transform.eulerAngles.y % 360) >= 0.0 && (this.transform.eulerAngles.y % 360) < 90.0)
            {
                drone_body.AddForceAtPosition(Vector3.right * (throttle_front_left / 2), front_left_motor.transform.position);
                drone_body.AddForceAtPosition(Vector3.left * (throttle_front_right / 2), front_right_motor.transform.position);

                drone_body.AddForceAtPosition(Vector3.right * (throttle_back_left / 2), back_left_motor.transform.position);
                drone_body.AddForceAtPosition(Vector3.left * (throttle_back_right / 2), back_right_motor.transform.position);

            }
            else if ((this.transform.eulerAngles.y % 360) >= 90.0 && (this.transform.eulerAngles.y % 360) < 180.0)
            {
                drone_body.AddForceAtPosition(Vector3.left * (throttle_front_left / 2), front_left_motor.transform.position);
                drone_body.AddForceAtPosition(Vector3.left * (throttle_front_right / 2), front_right_motor.transform.position);

                drone_body.AddForceAtPosition(Vector3.right * (throttle_back_left / 2), back_left_motor.transform.position);
                drone_body.AddForceAtPosition(Vector3.right * (throttle_back_right / 2), back_right_motor.transform.position);
            }
            else if ((this.transform.eulerAngles.y % 360) >= 180.0 && (this.transform.eulerAngles.y % 360) < 270.0)
            {
                drone_body.AddForceAtPosition(Vector3.left * (throttle_front_left / 2), front_left_motor.transform.position);
                drone_body.AddForceAtPosition(Vector3.right * (throttle_front_right / 2), front_right_motor.transform.position);

                drone_body.AddForceAtPosition(Vector3.left * (throttle_back_left / 2), back_left_motor.transform.position);
                drone_body.AddForceAtPosition(Vector3.right * (throttle_back_right / 2), back_right_motor.transform.position);
            }

            else if ((this.transform.eulerAngles.y % 360) > 270.0)
            {
                drone_body.AddForceAtPosition(Vector3.right * (throttle_front_left / 2), front_left_motor.transform.position);
                drone_body.AddForceAtPosition(Vector3.right * (throttle_front_right / 2), front_right_motor.transform.position);

                drone_body.AddForceAtPosition(Vector3.left * (throttle_back_left / 2), back_left_motor.transform.position);
                drone_body.AddForceAtPosition(Vector3.left * (throttle_back_right / 2), back_right_motor.transform.position);
            }
          
        }
          
    }

    List<int> get_discrete_state(List<float> state, List<float> descrete_os_win_size, List<int> observation_space_low)
    {
        List<int> discrete_state = new List<int>();

        for (int i = 0; i < state.Count; i++)
        {
            discrete_state.Add((int)Mathf.Floor((state[i] - observation_space_low[i]) / descrete_os_win_size[i]));
        }

        return discrete_state;
    }

    int max_index(List<float> table)
    {
        int max_i = 0;
        float max_value = table[0];
        for (int i = 1; i < table.Count; i++)
        {
            if (table[i] > max_value)
            {
                max_i = i;
                max_value = table[i];
            }
        }

        return max_i;
    }

    float max_value(List<float> table)
    {
        float max_v = table[0];
        for (int i = 1; i < table.Count; i++)
        {
            if (table[i] > max_v)
            {
                max_v = table[i];
            }
        }

        return max_v;
    }  
}
